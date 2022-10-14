import { defer } from "https://deno.land/x/pbkit@v0.0.45/core/runtime/async/observer.ts";
import { Socket } from "../socket.ts";
import { createIosSocket } from "../glue/ios.ts";
import { createAndroidSocket } from "../glue/android.ts";
import { createParentWindowSocket } from "../glue/parent-window.ts";

export type UnsubscribeFn = () => void;
export type SetSocketFn = (socket?: Socket, error?: Error) => void;
export function subscribeParentSocket(set: SetSocketFn): UnsubscribeFn {
  let run = true;
  const unsubscribe = () => (run = false);
  const parent = globalThis.opener || globalThis.parent;
  if (parent && parent !== globalThis.self) {
    (async () => {
      while (run) {
        const closed = defer<void>();
        try {
          const socket = await createParentWindowSocket({
            parent,
            parentWindowOrigin: "*",
            onClosed: () => closed.resolve(),
          });
          run && set(socket, undefined);
        } catch (error) {
          run && set(undefined, error);
        }
        await closed;
        run && set(undefined, undefined);
      }
    })();
  } else {
    getAndroidOrIosSocket().then(
      (socket) => run && set(socket),
    ).catch(
      (error) => run && set(undefined, error),
    );
  }
  return unsubscribe;
}

async function getAndroidOrIosSocket(): Promise<Socket | undefined> {
  try {
    return await Promise.any([createAndroidSocket(), createIosSocket()]);
  } catch {}
  return;
}
