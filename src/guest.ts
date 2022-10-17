import {
  createEventBuffer,
  EventBuffer,
} from "https://deno.land/x/pbkit@v0.0.45/core/runtime/async/event-buffer.ts";
import {
  defer,
  Deferred,
} from "https://deno.land/x/pbkit@v0.0.45/core/runtime/async/observer.ts";
import type { WrpChannel } from "./channel.ts";
import { LazyMetadata, Metadata, resolveLazyMetadata } from "./metadata.ts";

export interface WrpGuest {
  readonly availableMethods: Set<string>;
  request(
    methodName: string,
    req: AsyncGenerator<Uint8Array>,
    metadata?: LazyMetadata,
  ): {
    res: AsyncGenerator<Uint8Array>;
    header: Promise<Metadata>;
    trailer: Promise<Metadata>;
  };
}

export class WrpError extends Error {
  constructor(public message: string) {
    super(message);
  }
}

export interface CreateWrpGuestConfig {
  channel: WrpChannel;
  onError?: (error: WrpError) => void;
}
export async function createWrpGuest(
  config: CreateWrpGuestConfig,
): Promise<WrpGuest> {
  const { channel } = config;
  let availableMethods: Set<string>;
  const waitFirstHostInitialize = defer<void>();
  interface Request {
    eventBuffer: EventBuffer<Uint8Array>;
    header: Deferred<Metadata>;
    trailer: Deferred<Metadata>;
  }
  const requests: { [reqId: string]: Request } = {};
  function finishRequest(reqId: string, trailerObject: Record<string, string>) {
    const request = requests[reqId];
    request.trailer.resolve(trailerObject);
    if (trailerObject["wrp-status"] === "ok") {
      request.eventBuffer.finish();
    } else {
      const message = trailerObject["wrp-message"] || "";
      request.eventBuffer.error(new WrpError(message));
    }
    delete requests[reqId];
  }
  let reqIdCounter = 0;
  (async () => {
    for await (const { message } of channel.listen()) {
      if (message == null) continue;
      switch (message.field) {
        default:
          continue;
        case "HostInitialize": {
          const { value } = message;
          availableMethods = new Set(value.availableMethods);
          waitFirstHostInitialize.resolve();
          // handle host reconnection
          for (const reqId in requests) {
            finishRequest(reqId, {
              "wrp-status": "error",
              "wrp-message": "Host disconnected and reconnected.",
            });
          }
          continue;
        }
        case "HostError": {
          config.onError?.(new WrpError(message.value.message));
          continue;
        }
        case "HostResStart": {
          const { reqId, header } = message.value;
          requests[reqId]?.header.resolve(Object.fromEntries(header));
          continue;
        }
        case "HostResPayload": {
          const { reqId, payload } = message.value;
          requests[reqId]?.eventBuffer.push(payload);
          continue;
        }
        case "HostResFinish": {
          const { reqId, trailer } = message.value;
          if (!(reqId in requests)) continue;
          finishRequest(reqId, Object.fromEntries(trailer));
          continue;
        }
      }
    }
  })();
  await waitFirstHostInitialize;
  return {
    get availableMethods() {
      return availableMethods;
    },
    request(methodName, req, lazyMetadata) {
      const reqId = `${++reqIdCounter}`;
      const eventBuffer = createEventBuffer<Uint8Array>({
        onDrainEnd() {
          channel.send({
            message: {
              field: "GuestResFinish",
              value: { reqId },
            },
          });
        },
      });
      const header = defer<Metadata>();
      const trailer = defer<Metadata>();
      const res = eventBuffer.drain();
      requests[reqId] = { eventBuffer, header, trailer };
      (async () => {
        try {
          const metadata = new Map(Object.entries(
            await resolveLazyMetadata(lazyMetadata),
          ));
          channel.send({
            message: {
              field: "GuestReqStart",
              value: { reqId, methodName, metadata },
            },
          });
          for await (const payload of req) {
            channel.send({
              message: {
                field: "GuestReqPayload",
                value: { reqId, payload },
              },
            });
          }
        } finally {
          channel.send({
            message: {
              field: "GuestReqFinish",
              value: { reqId },
            },
          });
        }
      })();
      return { res, header, trailer };
    },
  };
}
