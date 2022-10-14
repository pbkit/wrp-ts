import { Closer, Socket } from "../socket.ts";
import { checkAndRetryUntilSuccess } from "./misc/util.ts";
import { createChildWindowSocket } from "./child-window.ts";

export interface CreateIframeSocketConfig {
  iframeElement: HTMLIFrameElement;
  iframeOrigin: string;
  onClosed?: () => void;
}
export async function createIframeSocket(
  config: CreateIframeSocketConfig,
): Promise<Closer & Socket> {
  const { iframeElement, iframeOrigin, onClosed } = config;
  const iframeWindow = await checkAndRetryUntilSuccess(
    () => iframeElement.contentWindow || undefined,
  );
  const childWindowSocket = await createChildWindowSocket({
    child: iframeWindow,
    childOrigin: iframeOrigin,
    onClosed,
  });
  onceIframeReloaded(iframeElement, childWindowSocket.close);
  return childWindowSocket;
}

function onceIframeReloaded(iframeElement: HTMLIFrameElement, fn: () => void) {
  iframeElement.addEventListener("load", loadHandler);
  function loadHandler() {
    iframeElement.removeEventListener("load", loadHandler);
    fn();
  }
}
