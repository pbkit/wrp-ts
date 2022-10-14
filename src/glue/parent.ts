import { Socket } from "../socket.ts";
import { createIosSocket } from "../glue/ios.ts";
import { createAndroidSocket } from "../glue/android.ts";
import { createParentWindowSocket } from "../glue/parent-window.ts";

export type UnsubscribeFn = () => void;
export function subscribeParentSocket(setSocket: (socket: Socket) => void): UnsubscribeFn {
  const unsubscribe = () => {};
  function connect() {
    Promise.any([
      createAndroidSocket(),
      createIosSocket(),
      createParentWindowSocket({
        parent: globalThis.opener || globalThis.parent,
        parentWindowOrigin: "*",
      })
    ]);
  }
}
