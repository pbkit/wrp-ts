import {
  MethodDescriptor,
  MethodImplHandlerReq,
} from "https://deno.land/x/pbkit@v0.0.45/core/runtime/rpc.ts";
import { first } from "https://deno.land/x/pbkit@v0.0.45/core/runtime/async/async-generator.ts";
import { createEventBuffer } from "https://deno.land/x/pbkit@v0.0.45/core/runtime/async/event-buffer.ts";
import {
  createEventEmitter,
  EventEmitter,
} from "https://deno.land/x/pbkit@v0.0.45/core/runtime/async/event-emitter.ts";
import { useEffect, useRef } from "react";
import { WrpChannel } from "../channel.ts";
import { createWrpHost, WrpRequest } from "../host.ts";
import { createWrpServer, createWrpServerImplBuilder } from "../rpc/server.ts";

export function useWrpServer<TState extends Record<string, any>>(
  channel: WrpChannel | undefined,
  state: TState,
  ...rpcs: MethodImpl<TState, MethodDescriptor<any, any>>[]
) {
  const ref = useRef<Ref<TState> | undefined>(undefined);
  useEffect(() => {
    if (!channel) return;
    if (!ref.current) ref.current = createRef();
    const getState = () => ref.current?.state!;
    const changes = ref.current.changes;
    (async () => {
      const host = await createWrpHost({
        channel,
        availableMethods: new Set(
          rpcs.map(({ methodDescriptor: { service, methodName } }) =>
            `${service.serviceName}/${methodName}`
          ),
        ),
      });
      const builder = createWrpServerImplBuilder();
      for (const { methodDescriptor, handler } of rpcs) {
        builder.register(
          methodDescriptor,
          async (req, res) => {
            const { requestStream, responseStream } = methodDescriptor;
            const { teardown, callTeardown } = getTeardown(req);
            const stateChanges = new Proxy({}, {
              get(_, key) {
                const eb = createEventBuffer();
                teardown(changes.on(key as keyof TState, eb.push));
                teardown(eb.finish);
                return eb.drain();
              },
            }) as StateChanges<TState>;
            try {
              res.header({});
              const _req = requestStream ? req.messages : first(req.messages);
              const _res = handler({
                req: _req,
                getState,
                stateChanges,
                teardown,
              });
              if (responseStream) {
                for await (const value of _res as AsyncGenerator<any>) {
                  res.send(value);
                }
              } else {
                res.send(await _res);
              }
              res.end({});
            } catch (err) {
              res.end({
                "wrp-status": "error",
                "wrp-message": err?.message ?? "",
              });
            } finally {
              callTeardown();
            }
          },
        );
      }
      builder.finish();
      const methods = builder.drain();
      const server = await createWrpServer({ host, methods });
      server.listen();
    })();
  }, [channel]);
  useEffect(() => {
    if (!ref.current) ref.current = createRef();
    const prev = { ...ref.current.state };
    ref.current.state = state;
    for (const key of new Set([...Object.keys(prev), ...Object.keys(state)])) {
      if (prev[key] !== state[key]) {
        ref.current.changes.emit(key, state[key]);
      }
    }
  }, [state]);
}

interface Ref<TState> {
  state: TState;
  changes: EventEmitter<TState>;
}
function createRef<TState>(): Ref<TState> {
  return {
    state: undefined as unknown as TState,
    changes: createEventEmitter(),
  };
}

export function rpc<
  TState extends Record<string, any>,
  TMethodDescriptor extends MethodDescriptor<any, any>,
>(
  methodDescriptor: TMethodDescriptor,
  handler: RpcHandler<
    TState,
    TMethodDescriptor["requestStream"],
    TMethodDescriptor["responseStream"],
    Parameters<TMethodDescriptor["requestType"]["serializeBinary"]>[0],
    Parameters<TMethodDescriptor["responseType"]["serializeBinary"]>[0]
  >,
): MethodImpl<TState, TMethodDescriptor> {
  return { methodDescriptor, handler };
}

export type GetStateFn<TState extends Record<string, any>> = () => TState;

export type StateChanges<TState extends Record<string, any>> = {
  [key in keyof TState]: AsyncGenerator<TState[key]>;
};

export type TeardownFn = (handler: () => void) => void;

interface GetTeardownResult {
  teardown: TeardownFn;
  callTeardown: () => void;
}
function getTeardown(
  req: MethodImplHandlerReq<any, WrpRequest>,
): GetTeardownResult {
  const handlers: (() => void)[] = [];
  const teardown: TeardownFn = (handler) => handlers.push(handler);
  const o1 = req.metadata?.on("cancel-response", callTeardown);
  const o2 = req.metadata?.on("close", callTeardown);
  const offAll = () => (o1?.(), o2?.());
  function callTeardown() {
    offAll();
    for (const handler of handlers) handler();
    handlers.length = 0;
  }
  return { teardown, callTeardown };
}

export interface MethodImpl<
  TState,
  TMethodDescriptor extends MethodDescriptor<any, any>,
> {
  methodDescriptor: TMethodDescriptor;
  handler: RpcHandler<
    TState,
    TMethodDescriptor["requestStream"],
    TMethodDescriptor["responseStream"],
    Parameters<TMethodDescriptor["requestType"]["serializeBinary"]>[0],
    Parameters<TMethodDescriptor["responseType"]["serializeBinary"]>[0]
  >;
}

export interface RpcHandler<
  TState extends Record<string, any>,
  TReqStream extends boolean,
  TResStream extends boolean,
  TReq,
  TRes,
> {
  (param: {
    req: RpcReq<TReq, TReqStream>;
    getState: GetStateFn<TState>;
    stateChanges: StateChanges<TState>;
    teardown: TeardownFn;
  }): RpcRes<TRes, TResStream>;
}

type RpcReq<T, IsStream extends boolean> = IsStream extends true
  ? AsyncGenerator<T>
  : T;
type RpcRes<T, IsStream extends boolean> = IsStream extends true
  ? AsyncGenerator<T>
  : Promise<T>;
