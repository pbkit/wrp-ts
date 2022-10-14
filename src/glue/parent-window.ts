import { Closer, Socket } from "../socket.ts";
import { getGlue } from "./index.ts";
import {
  isGlueEvent,
  isGlueHandshakeEvent,
  postGlueHandshakeMessage,
  postGlueMessage,
} from "./misc/web.ts";

// https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API
// https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage

export interface CreateParentWindowSocketConfig {
  parent?: Window | null;
  parentOrigin: string;
  onClosed?: () => void;
}
export async function createParentWindowSocket(
  config: CreateParentWindowSocketConfig,
): Promise<Closer & Socket> {
  const { parent = globalThis.parent, parentOrigin, onClosed } = config;
  if (!parent?.postMessage) throw new Error("There is no parent window.");
  if (parent === globalThis.self) throw new Error("Invalid parent window.");
  let handshakeIsDone = false;
  globalThis.addEventListener("message", messageHandler);
  globalThis.addEventListener("message", handshakeHandler);
  const glue = getGlue();
  const connId = setInterval(syn, 100);
  syn();
  return {
    read: glue.read,
    async write(data) {
      const length = data.byteLength;
      const success = postGlueMessage({
        target: parent,
        targetOrigin: parentOrigin,
        payload: data,
      });
      if (!success) close();
      return success ? length : 0;
    },
    close,
  };
  function close() {
    clearInterval(connId);
    globalThis.removeEventListener("message", messageHandler);
    globalThis.removeEventListener("message", handshakeHandler);
    glue.close();
    onClosed?.();
  }
  function syn() {
    const success = postGlueHandshakeMessage({
      target: parent!,
      targetOrigin: parentOrigin,
      payload: "syn",
    });
    if (!success) close();
  }
  function ack() {
    handshakeIsDone = true;
    const success = postGlueHandshakeMessage({
      target: parent!,
      targetOrigin: parentOrigin,
      payload: "ack",
    });
    if (!success) close();
  }
  function messageHandler(e: MessageEvent) {
    if (e.source !== parent) return;
    if (!isGlueEvent(e)) return;
    const [, data] = e.data;
    glue.recv(data);
  }
  function handshakeHandler(event: any) {
    if (event.source !== parent) return;
    if (!isGlueHandshakeEvent(event)) return;
    const [, payload] = event.data;
    if (payload === "syn-ack") {
      if (handshakeIsDone) close();
      else ack();
    }
  }
}
