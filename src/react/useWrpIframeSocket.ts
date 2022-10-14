import { defer } from "https://deno.land/x/pbkit@v0.0.45/core/runtime/async/observer.ts";
import { Ref, useEffect, useRef, useState } from "react";
import { Closer, Socket } from "../socket.ts";
import { createIframeSocket } from "../glue/iframe.ts";

export interface UseWrpIframeSocketResult {
  iframeRef: Ref<HTMLIFrameElement>;
  socket: Socket | undefined;
}
export default function useWrpIframeSocket(): UseWrpIframeSocketResult {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [socket, setSocket] = useState<Socket | undefined>(undefined);
  useOnceEffect(() => {
    let socket: Closer & Socket;
    let unmounted = false;
    let waitForReconnect = defer<void>();
    const iframeElement = iframeRef.current!;
    (async () => { // reconnection loop
      while (true) {
        if (unmounted) return;
        try {
          socket = await createIframeSocket({
            iframeElement,
            iframeOrigin: "*",
            onClosed: tryReconnect,
          });
          setSocket(socket);
          await waitForReconnect;
        } catch { /* ignore handshake timeout */ }
      }
    })();
    return () => {
      unmounted = true;
      tryReconnect();
    };
    function tryReconnect() {
      waitForReconnect.resolve();
      waitForReconnect = defer<void>();
    }
  });
  return { iframeRef, socket };
}

// Guaranteed to be called only once in a component's lifecycle.
// It called only once, even in strict mode.
const useOnceEffect: typeof useEffect = (effect) => {
  const effectHasFiredRef = useRef<true>();
  useEffect(() => {
    if (effectHasFiredRef.current) return;
    else effectHasFiredRef.current = true;
    return effect();
  }, []);
};
