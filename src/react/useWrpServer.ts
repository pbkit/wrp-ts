import {
  MethodDescriptor,
  MethodImplHandler,
} from "https://deno.land/x/pbkit@v0.0.45/core/runtime/rpc.ts";
import {
  createEventEmitter,
  EventEmitter,
} from "https://deno.land/x/pbkit@v0.0.45/core/runtime/async/event-emitter.ts";
import { useEffect, useRef } from "react";
import { WrpChannel } from "../channel.ts";
import { createWrpHost, WrpRequest } from "../host.ts";
import { Metadata } from "../metadata.ts";
import { createWrpServer, createWrpServerImplBuilder } from "../rpc/server.ts";

export type GetStateFn<TState> = () => TState;
export type MethodImpl<TState extends Record<string, any>, TReq, TRes> = [
  MethodDescriptor<TReq, TRes>,
  (
    params: {
      req: Parameters<
        MethodImplHandler<TReq, TRes, WrpRequest, Metadata, Metadata>
      >[0];
      res: Parameters<
        MethodImplHandler<TReq, TRes, WrpRequest, Metadata, Metadata>
      >[1];
      getState: GetStateFn<TState>;
      stateChanges: EventEmitter<TState>;
    },
  ) => void,
];
export default function useWrpServer<
  TState extends Record<string, any>,
  TMethodImpls extends MethodImpl<TState, any, any>[],
>(
  channel: WrpChannel | undefined,
  state: TState,
  methodImpls: TMethodImpls,
) {
  const ref = useRef<Ref<TState> | undefined>(undefined);
  useEffect(() => {
    if (!channel) return;
    if (!ref.current) ref.current = createRef();
    const getState = () => ref.current?.state!;
    const stateChanges = ref.current.stateChanges;
    (async () => {
      const host = await createWrpHost({
        channel,
        availableMethods: new Set(
          methodImpls.map(([{ service, methodName }]) =>
            `${service.serviceName}/${methodName}`
          ),
        ),
      });
      const builder = createWrpServerImplBuilder();
      for (const [methodDescriptor, methodImpl] of methodImpls) {
        builder.register(
          methodDescriptor,
          (req, res) => methodImpl({ req, res, getState, stateChanges }),
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
    const prev = { ...ref.current?.state };
    ref.current.state = state;
    for (const key of new Set([...Object.keys(prev), ...Object.keys(state)])) {
      if (prev[key] !== state[key]) {
        ref.current.stateChanges.emit(key, state[key]);
      }
    }
  }, [state]);
}

interface Ref<TState> {
  state: TState;
  stateChanges: EventEmitter<TState>;
}
function createRef<TState>(): Ref<TState> {
  return {
    state: undefined as unknown as TState,
    stateChanges: createEventEmitter(),
  };
}
