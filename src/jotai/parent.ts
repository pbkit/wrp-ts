import { atom } from "jotai";
import { createIosSocket } from "../glue/ios.ts";
import { createAndroidSocket } from "../glue/android.ts";
import { createParentWindowSocket } from "../glue/parent-window.ts";
import {
  ChannelAtom,
  ClientAtom,
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
export const guestAtom: GuestAtom = wrpAtomSet.guestAtom;
export const clientAtom: ClientAtom = wrpAtomSet.clientAtom;
