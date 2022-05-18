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
  availableMethods: Set<string>;
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
  const availableMethodsPromise = defer<Set<string>>();
  interface Request {
    eventBuffer: EventBuffer<Uint8Array>;
    header: Deferred<Metadata>;
    trailer: Deferred<Metadata>;
  }
  const requests: { [reqId: string]: Request } = {};
  let reqIdCounter = BigInt(0);
  (async () => {
    for await (const { message } of channel.listen()) {
      if (message == null) continue;
      switch (message.field) {
        default:
          continue;
        case "HostInitialize": {
          const { value } = message;
          availableMethodsPromise.resolve(new Set(value.availableMethods));
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
          const request = requests[reqId];
          const trailerObject = Object.fromEntries(trailer);
          request.trailer.resolve(trailerObject);
          if (trailerObject["wrp-status"] === "ok") {
            request.eventBuffer.finish();
          } else {
            const message = trailerObject["wrp-message"] || "";
            request.eventBuffer.error(new WrpError(message));
          }
          delete requests[reqId];
          continue;
        }
      }
    }
  })();
  return {
    availableMethods: await availableMethodsPromise,
    request(methodName, req, lazyMetadata) {
      const reqId = `${reqIdCounter += 1n}`;
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
