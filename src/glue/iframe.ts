import { Disposable, Socket } from "../socket.ts";
import { checkAndRetryUntilSuccess } from "./misc.ts";
import { createGlue } from "./index.ts";
import { isGlueEvent } from "./parent-window.ts";

const key = "<glue>";

export interface CreateIframeSocketConfig {
  iframeElement: HTMLIFrameElement;
  iframeOrigin: string;
  onDisposed?: () => void;
}
export async function createIframeSocket(
  config: CreateIframeSocketConfig,
): Promise<Disposable & Socket> {
  const { iframeElement, iframeOrigin, onDisposed } = config;
  await handshake(iframeElement);
  const glue = createGlue();
  globalThis.addEventListener("message", messageHandler);
  onceIframeReloaded(iframeElement, dispose);
  return {
    dispose,
    read: glue.read,
    async write(data) {
      const { contentWindow } = iframeElement;
      if (!contentWindow) throw new Error("Iframe has been unloaded.");
      const length = data.byteLength;
      contentWindow.postMessage([key, data], iframeOrigin, [data.buffer]);
      return length;
    },
  };
  function messageHandler(event: any) {
    if (!isGlueEvent(event)) return;
    glue.recv(event.data[1]);
  }
  function dispose() {
    globalThis.removeEventListener("message", messageHandler);
    glue.dispose();
    onDisposed?.();
  }
}

async function handshake(iframeElement: HTMLIFrameElement): Promise<void> {
  let done: true | undefined;
  globalThis.addEventListener("message", handshakeHandler);
  ping();
  await checkAndRetryUntilSuccess(() => done, ping, 100, 100);
  function ping() {
    iframeElement.contentWindow?.postMessage([key, "ping"], "*");
  }
  function handshakeHandler(event: any) {
    if (!isGlueEvent(event)) return;
    if (event.data[1] === "pong") {
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
