import { defer } from "https://deno.land/x/pbkit@v0.0.45/core/runtime/async/observer.ts";
import { Socket } from "../socket.ts";
import { getGlue, isGlueEvent } from "./index.ts";

// https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API
// https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage

const key = "<glue>";

export interface CreateParentWindowSocketConfig {
  parentWindowOrigin: string;
}
export async function createParentWindowSocket(
  config: CreateParentWindowSocketConfig,
): Promise<Socket> {
  if (globalThis.top === globalThis.self) throw new Error("This is the top.");
  if (!("parent" in globalThis) || !globalThis.parent?.postMessage) {
    throw new Error("There is no parent window.");
  }
  const { parentWindowOrigin } = config;
  const wait = defer<void>();
  const glue = getGlue();
  globalThis.addEventListener("message", (event: any) => {
    if (event.source !== globalThis.parent) return;
    if (!isGlueEvent(event)) return;
    const [, isHandshakeMessage, payload] = event.data;
    if (isHandshakeMessage) {
      if (payload === "ping") {
        globalThis.parent.postMessage([key, true, "pong"], "*");
        wait.resolve();
      }
    } else {
      glue.recv(payload);
    }
  });
  setTimeout(() => {
    wait.reject(new Error("Handshake timeout."));
  }, 500);
  await wait;
  return {
    read: glue.read,
    async write(data) {
      const length = data.byteLength;
      const { postMessage } = globalThis.parent;
      postMessage([key, false, data], parentWindowOrigin, [data.buffer]);
      return length;
    },
  };
}
