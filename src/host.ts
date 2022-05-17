import {
  createEventBuffer,
  EventBuffer,
} from "https://deno.land/x/pbkit@v0.0.45/core/runtime/async/event-buffer.ts";
import type { WrpChannel } from "./channel.ts";
import type { Metadata } from "./metadata.ts";

export interface WrpHost {
  listen(): AsyncGenerator<WrpRequest>;
}
export interface WrpRequest {
  methodName: string;
  metadata: Metadata;
  req: AsyncGenerator<Uint8Array>;
  sendHeader(value: Metadata): void;
  sendPayload(value: Uint8Array): void;
  sendTrailer(value: Metadata): void;
}

export interface CreateWrpHostConfig {
  channel: WrpChannel;
  availableMethods: Set<string>;
}
export async function createWrpHost(
  config: CreateWrpHostConfig,
): Promise<WrpHost> {
  const { channel, availableMethods } = config;
  type Request = EventBuffer<Uint8Array>;
  const requests: { [reqId: string]: Request } = {};
  await channel.send({
    message: {
      field: "HostInitialize",
      value: { availableMethods: Array.from(availableMethods) },
    },
  });
  return {
    async *listen() {
      for await (const { message } of channel.listen()) {
        if (message == null) {
          channel.send({
            message: {
              field: "HostError",
              value: { message: "Received null message" },
            },
          });
          continue;
        }
        switch (message.field) {
          case "GuestReqStart": {
            const { reqId, methodName, metadata } = message.value;
            const request = requests[reqId] = createEventBuffer();
            const req = request.drain();
            yield {
              methodName,
              metadata: Object.fromEntries(metadata),
              req,
              sendHeader(header) {
                channel.send({
                  message: {
                    field: "HostResStart",
                    value: { reqId, header: new Map(Object.entries(header)) },
                  },
                });
              },
              sendPayload(payload) {
                channel.send({
                  message: {
                    field: "HostResPayload",
                    value: { reqId, payload },
                  },
                });
              },
              sendTrailer(trailer) {
                trailer["wrp-status"] ||= "ok";
                trailer["wrp-message"] ||= "";
                channel.send({
                  message: {
                    field: "HostResFinish",
                    value: { reqId, trailer: new Map(Object.entries(trailer)) },
                  },
                });
              },
            };
            continue;
          }
          case "GuestReqPayload": {
            const { reqId, payload } = message.value;
            if (reqId in requests) {
              requests[reqId].push(payload);
            } else {
              channel.send({
                message: {
                  field: "HostError",
                  value: {
                    message:
                      `Received unexpected request payload for { reqId: "${reqId}" }`,
                  },
                },
              });
            }
            continue;
          }
          case "GuestReqFinish": {
            const { reqId } = message.value;
            if (reqId in requests) {
              requests[reqId].finish();
              delete requests[reqId];
            } else {
              channel.send({
                message: {
                  field: "HostError",
                  value: {
                    message:
                      `Received unexpected request finish for { reqId: "${reqId}" }`,
                  },
                },
              });
            }
            continue;
          }
        }
      }
    },
  };
}
