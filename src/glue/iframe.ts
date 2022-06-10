import { Closer, Socket } from "../socket.ts";
import { checkAndRetryUntilSuccess } from "./misc.ts";
import { createGlue, isGlueEvent } from "./index.ts";

const key = "<glue>";

export interface CreateIframeSocketConfig {
  iframeElement: HTMLIFrameElement;
  iframeOrigin: string;
  onClosed?: () => void;
}
export async function createIframeSocket(
  config: CreateIframeSocketConfig,
): Promise<Closer & Socket> {
  const { iframeElement, iframeOrigin, onClosed } = config;
  await handshake(iframeElement);
  const glue = createGlue();
  globalThis.addEventListener("message", messageHandler);
  onceIframeReloaded(iframeElement, close);
  return {
    close,
    read: glue.read,
    async write(data) {
      const { contentWindow } = iframeElement;
      if (!contentWindow) throw new Error("Iframe has been unloaded.");
      const length = data.byteLength;
      contentWindow.postMessage(
        [key, false, data],
        iframeOrigin,
        [data.buffer],
      );
      return length;
    },
  };
  function messageHandler(event: any) {
    if (event.source !== iframeElement.contentWindow) return;
    if (!isGlueEvent(event)) return;
    const [, isHandshakeMessage, payload] = event.data;
    if (isHandshakeMessage) return;
    glue.recv(payload);
  }
  function close() {
    globalThis.removeEventListener("message", messageHandler);
    glue.close();
    onClosed?.();
  }
}

async function handshake(iframeElement: HTMLIFrameElement): Promise<void> {
  let done: true | undefined;
  globalThis.addEventListener("message", handshakeHandler);
  ping();
  await checkAndRetryUntilSuccess(() => done, ping, 100, 100);
  function ping() {
    iframeElement.contentWindow?.postMessage([key, true, "ping"], "*");
  }
  function handshakeHandler(event: any) {
    if (event.source !== iframeElement.contentWindow) return;
    if (!isGlueEvent(event)) return;
    const [, isHandshakeMessage, payload] = event.data;
    if (!isHandshakeMessage) return;
    if (payload === "pong") {
      done = true;
      globalThis.removeEventListener("message", handshakeHandler);
    }
  }
}

function onceIframeReloaded(iframeElement: HTMLIFrameElement, fn: () => void) {
  iframeElement.addEventListener("load", loadHandler);
  function loadHandler() {
    iframeElement.removeEventListener("load", loadHandler);
    fn();
  }
}
