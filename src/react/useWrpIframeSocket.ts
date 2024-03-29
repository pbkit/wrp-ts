import { defer } from "https://deno.land/x/pbkit@v0.0.45/core/runtime/async/observer.ts";
import { Ref, useRef, useState } from "react";
import { Closer, Socket } from "../socket.ts";
import { createIframeSocket } from "../glue/iframe.ts";
import useOnceEffect from "./useOnceEffect.ts";

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
