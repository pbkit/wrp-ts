import {
  createEventBuffer,
  EventBuffer,
} from "https://deno.land/x/pbkit@v0.0.45/core/runtime/async/event-buffer.ts";
import {
  createEventEmitter,
  EventEmitter,
} from "https://deno.land/x/pbkit@v0.0.45/core/runtime/async/event-emitter.ts";
import type { WrpChannel } from "./channel.ts";
import type { Metadata } from "./metadata.ts";

export interface WrpHost {
  listen(): AsyncGenerator<WrpRequest>;
}
export interface WrpRequest extends EventEmitter<WrpRequestEvents> {
  methodName: string;
  metadata: Metadata;
  req: AsyncGenerator<Uint8Array>;
  sendHeader(value: Metadata): void;
  sendPayload(value: Uint8Array): void;
  sendTrailer(value: Metadata): void;
}
interface WrpRequestEvents {
  "cancel-response": void;
  "dispose": void;
}

interface RequestHandlingState {
  reqId: string;
  request: WrpRequest;
  eventBuffer: EventBuffer<Uint8Array>;
  reqFinished: boolean;
  resFinished: boolean;
}
interface RequestHandlingStateTable {
  [reqId: string]: RequestHandlingState;
}

export interface CreateWrpHostConfig {
  channel: WrpChannel;
  availableMethods: Set<string>;
}
export async function createWrpHost(
  config: CreateWrpHostConfig,
): Promise<WrpHost> {
  const { channel, availableMethods } = config;
  const states: RequestHandlingStateTable = {};
  function tryForgetState(state: RequestHandlingState): void {
    if (!state.reqFinished) return;
    if (!state.resFinished) return;
    delete states[state.reqId];
  }
  await channel.send({
    message: {
      field: "HostInitialize",
      value: { availableMethods: Array.from(availableMethods) },
    },
  });
  return {
    async *listen() {
      try {
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
              const eventBuffer = createEventBuffer<Uint8Array>({
                onDrainEnd() {
                  state.reqFinished = true;
                  tryForgetState(state);
                },
              });
              const request = createWrpRequest({
                methodName,
                channel,
                reqId,
                req: eventBuffer.drain(),
                metadata: Object.fromEntries(metadata),
              });
              const state: RequestHandlingState = states[reqId] = {
                reqId,
                request,
                eventBuffer,
                reqFinished: false,
                resFinished: false,
              };
              yield request;
              continue;
            }
            case "GuestReqPayload": {
              const { reqId, payload } = message.value;
              processMessage(channel, states, reqId, (state) => {
                state.eventBuffer.push(payload);
              });
              continue;
            }
            case "GuestReqFinish": {
              const { reqId } = message.value;
              processMessage(channel, states, reqId, (state) => {
                state.eventBuffer.finish();
                state.reqFinished = true;
                tryForgetState(state);
              });
              continue;
            }
            case "GuestResFinish": {
              const { reqId } = message.value;
              processMessage(channel, states, reqId, (state) => {
                state.request.emit("cancel-response", undefined);
                state.resFinished = true;
                tryForgetState(state);
              });
              continue;
            }
          }
        }
      } finally {
        for (const reqId in states) {
          states[reqId].request.emit("dispose", undefined);
          delete states[reqId];
        }
      }
    },
  };
}

function processMessage(
  channel: WrpChannel,
  states: RequestHandlingStateTable,
  reqId: string,
  fn: (request: RequestHandlingState) => void,
): void {
  if (reqId in states) {
    fn(states[reqId]);
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
}

interface CreateWrpRequestConfig {
  methodName: string;
  channel: WrpChannel;
  reqId: string;
  req: AsyncGenerator<Uint8Array>;
  metadata: Metadata;
}
function createWrpRequest(config: CreateWrpRequestConfig): WrpRequest {
  const { methodName, channel, reqId, req, metadata } = config;
  return {
    ...createEventEmitter(),
    methodName,
    metadata,
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
}
