import { atom, useAtomValue } from "jotai";
import type { RpcClientImpl } from "https://deno.land/x/pbkit@v0.0.45/core/runtime/rpc.ts";
import { createIosSocket } from "../glue/ios.ts";
import { createAndroidSocket } from "../glue/android.ts";
import { createParentWindowSocket } from "../glue/parent-window.ts";
import { WrpChannel } from "../channel.ts";
import { WrpGuest } from "../guest.ts";
import {
  ChannelAtom,
  ClientImplAtom,
  createWrpAtomSet,
  GuestAtom,
  SocketAtom,
  WrpAtomSet,
} from "./index.ts";

export const socketAtom: SocketAtom = atom(async () => {
  return await Promise.any([
    createAndroidSocket(),
    createIosSocket(),
    createParentWindowSocket({ parentWindowOrigin: "*" }),
  ]).catch(() => undefined);
});

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
