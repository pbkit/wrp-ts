import { atom } from "jotai";
import { Socket } from "../socket.ts";
import { createIosSocket } from "../glue/ios.ts";
import { createAndroidSocket } from "../glue/android.ts";
import { createParentWindowSocket } from "../glue/parent-window.ts";
import { createWrpAtomSet } from "./index.ts";

export const socketAtom = atom<Promise<Socket | undefined>>(async () => {
  return await Promise.any([
    createAndroidSocket(),
    createIosSocket(),
    createParentWindowSocket({ parentWindowOrigin: "*" }),
  ]).catch(() => undefined);
});
const wrpAtomSet = createWrpAtomSet(socketAtom);
export const channelAtom = wrpAtomSet.channelAtom;
export const guestAtom = wrpAtomSet.guestAtom;
export const clientAtom = wrpAtomSet.clientAtom;
