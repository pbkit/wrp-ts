import {
  createEventBuffer,
  EventBuffer,
} from "https://deno.land/x/pbkit@v0.0.45/core/runtime/async/event-buffer.ts";
import {
  defer,
  Deferred,
} from "https://deno.land/x/pbkit@v0.0.45/core/runtime/async/observer.ts";
import type { WvrpChannel } from "./channel.ts";

export interface WvrpGuest {
  availableMethods: Set<string>;
  request(
    name: string,
    metadata: Map<string, string>,
    req: AsyncGenerator<Uint8Array>,
  ): {
    res: AsyncGenerator<Uint8Array>;
    header: Promise<Map<string, string>>;
    trailer: Promise<Map<string, string>>;
  };
}

export class WvrpError extends Error {
  constructor(public message: string) {
    super(message);
  }
}

export interface CreateWvrpGuestConfig {
  channel: WvrpChannel;
  onError?: (error: WvrpError) => void;
}
export async function createWvrpGuest(
  config: CreateWvrpGuestConfig,
): Promise<WvrpGuest> {
  const { channel } = config;
  const availableMethodsPromise = defer<Set<string>>();
  interface Request {
    eventBuffer: EventBuffer<Uint8Array>;
    header: Deferred<Map<string, string>>;
    trailer: Deferred<Map<string, string>>;
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
          config.onError?.(new WvrpError(message.value.message));
          continue;
        }
        case "HostResStart": {
          const { reqId, header } = message.value;
          requests[reqId]?.header.resolve(header);
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
          request.eventBuffer.finish();
          request.trailer.resolve(trailer);
          delete requests[reqId];
          continue;
        }
      }
    }
  })();
  return {
    availableMethods: await availableMethodsPromise,
    request(name, metadata, req) {
      const reqId = `${reqIdCounter += 1n}`;
      const eventBuffer = createEventBuffer<Uint8Array>();
      const header = defer<Map<string, string>>();
      const trailer = defer<Map<string, string>>();
      const res = eventBuffer.drain();
      requests[reqId] = { eventBuffer, header, trailer };
      channel.send({
        message: {
          field: "GuestReqStart",
          value: {
            reqId,
            methodName: name,
            metadata,
          },
        },
      });
      (async () => {
        try {
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
