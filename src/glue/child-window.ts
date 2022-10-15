import { defer } from "https://deno.land/x/pbkit@v0.0.45/core/runtime/async/observer.ts";
import { Closer, Socket } from "../socket.ts";
import { createGlue } from "./index.ts";
import {
  isGlueEvent,
  isGlueHandshakeEvent,
  postGlueHandshakeMessage,
  postGlueMessage,
} from "./misc/web.ts";

export interface CreateChildWindowSocketConfig {
  child: Window;
  childWindowOrigin: string;
  onClosed?: () => void;
}
export async function createChildWindowSocket(
  config: CreateChildWindowSocketConfig,
): Promise<Closer & Socket> {
  const { child, childWindowOrigin, onClosed } = config;
  await handshake(child, childWindowOrigin);
  globalThis.addEventListener("message", messageHandler);
  const healthcheckId = setInterval(healthcheck, 100);
  const glue = createGlue();
  return {
    read: glue.read,
    async write(data) {
      const length = data.byteLength;
      const success = postGlueMessage({
        target: child,
        targetOrigin: childWindowOrigin,
        payload: data,
      });
      if (!success) close();
      return success ? length : 0;
    },
    close,
  };
  function close() {
    clearInterval(healthcheckId);
    globalThis.removeEventListener("message", messageHandler);
    glue.close();
    onClosed?.();
  }
  function healthcheck() {
    if (child.closed) close();
  }
  function messageHandler(e: MessageEvent) {
    if (e.source !== parent) return;
    if (!isGlueEvent(e)) return;
    const [, data] = e.data;
    glue.recv(data);
  }
}

// wait syn -> send syn-ack -> wait ack
async function handshake(child: Window, childWindowOrigin: string) {
  let synAcked = false;
  const wait = defer<void>();
  const healthcheckId = setInterval(healthcheck, 100);
  const timeoutId = setTimeout(() => {
    abort(new Error("Handshake timeout."));
  }, 10000);
  globalThis.addEventListener("message", handshakeHandler);
  function handshakeHandler(e: MessageEvent) {
    if (e.source !== child) return;
    if (!isGlueHandshakeEvent(e)) return;
    const [, data] = e.data;
    if (data === "syn") {
      synAck();
    } else if (data === "ack") {
      if (synAcked) finish();
      else abort(new Error("Invalid ack."));
    }
  }
  return await wait;
  function healthcheck() {
    if (child.closed) abort(new Error("Child window is closed."));
  }
  function cleanup() {
    clearInterval(healthcheckId);
    clearTimeout(timeoutId);
    globalThis.removeEventListener("message", handshakeHandler);
  }
  function abort(reason: Error) {
    cleanup();
    wait.reject(reason);
  }
  function finish() {
    cleanup();
    wait.resolve();
  }
  function synAck() {
    synAcked = true;
    const success = postGlueHandshakeMessage({
      target: child,
      targetOrigin: childWindowOrigin,
      payload: "syn-ack",
    });
    if (!success) abort(new Error("Failed to send syn-ack."));
  }
}
