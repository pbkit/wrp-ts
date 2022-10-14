import { atom, useAtomValue, useSetAtom } from "jotai";
import type { RpcClientImpl } from "https://deno.land/x/pbkit@v0.0.45/core/runtime/rpc.ts";
import { Socket } from "../socket.ts";
import { WrpChannel } from "../channel.ts";
import { WrpGuest } from "../guest.ts";
import useOnceEffect from "../react/useOnceEffect.ts";
import { subscribeParentSocket } from "../glue/parent.ts";
import {
  ChannelAtom,
  ClientImplAtom,
  createWrpAtomSet,
  GuestAtom,
  PrimitiveSocketAtom,
  WrpAtomSet,
} from "./index.ts";

/**
 * Use it on root of your react application
 */
export function useInitParentSocketEffect() {
  const setSocket = useSetAtom(socketAtom);
  useOnceEffect(() => subscribeParentSocket(setSocket));
}

export const socketAtom: PrimitiveSocketAtom = atom<Socket | undefined>(
  undefined,
);

const wrpAtomSet: WrpAtomSet = createWrpAtomSet(socketAtom);

export const channelAtom: ChannelAtom = wrpAtomSet.channelAtom;
export function useChannel(): WrpChannel | undefined {
  return useAtomValue(wrpAtomSet.channelAtom);
}

export const guestAtom: GuestAtom = wrpAtomSet.guestAtom;
export function useGuest(): WrpGuest | undefined {
  return useAtomValue(wrpAtomSet.guestAtom);
}

export const clientImplAtom: ClientImplAtom = wrpAtomSet.clientImplAtom;
export function useClientImpl(): RpcClientImpl | undefined {
  return useAtomValue(wrpAtomSet.clientImplAtom);
}
