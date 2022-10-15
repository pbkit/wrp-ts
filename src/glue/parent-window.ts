import { defer } from "https://deno.land/x/pbkit@v0.0.45/core/runtime/async/observer.ts";
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
  parentWindowOrigin: string;
  onClosed?: () => void;
}
export async function createParentWindowSocket(
  config: CreateParentWindowSocketConfig,
): Promise<Closer & Socket> {
  const { parent = globalThis.parent, parentWindowOrigin, onClosed } = config;
  if (!parent?.postMessage) throw new Error("There is no parent window.");
  if (parent === globalThis.self) throw new Error("Invalid parent window.");
  const wait = defer<void>();
  let acked = false;
  globalThis.addEventListener("message", messageHandler);
  globalThis.addEventListener("message", handshakeHandler);
  const glue = getGlue();
  const connId = setInterval(syn, 100);
  syn();
  await wait;
  return {
    read: glue.read,
    async write(data) {
      const length = data.byteLength;
      const success = postGlueMessage({
        target: parent,
        targetOrigin: parentWindowOrigin,
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
    wait.reject(new Error("Connection closed."));
  }
  function syn() {
    const success = postGlueHandshakeMessage({
      target: parent!,
      targetOrigin: parentWindowOrigin,
      payload: "syn",
    });
    if (!success) close();
  }
  function ack() {
    acked = true;
    const success = postGlueHandshakeMessage({
      target: parent!,
      targetOrigin: parentWindowOrigin,
      payload: "ack",
    });
    if (success) wait.resolve();
    else close();
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
      if (acked) close();
      else ack();
    }
  }
}
