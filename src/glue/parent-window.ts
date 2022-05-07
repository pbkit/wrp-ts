import { defer } from "https://deno.land/x/pbkit@v0.0.45/core/runtime/async/observer.ts";
import { Socket } from "../socket.ts";
import { getGlue } from "./index.ts";

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
  await handshake();
  const glue = getGlue();
  globalThis.addEventListener("message", (event: any) => {
    if (!isGlueEvent(event)) return;
    glue.recv(event.data[1]);
  });
  return {
    read: glue.read,
    async write(data) {
      const length = data.byteLength;
      const { postMessage } = globalThis.parent;
      postMessage([key, data], parentWindowOrigin, [data.buffer]);
      return length;
    },
  };
}

function handshake(): Promise<void> {
  const wait = defer<void>();
  globalThis.addEventListener("message", handshakeHandler);
  return wait;
  function handshakeHandler(event: any) {
    if (!isGlueEvent(event)) return;
    if (event.data[1] === "ping") {
      globalThis.parent.postMessage([key, "pong"], "*");
      globalThis.removeEventListener("message", handshakeHandler);
      wait.resolve();
    }
  }
}

export interface GlueEvent {
  data: [typeof key, Uint8Array | string];
}
export function isGlueEvent(event: any): event is GlueEvent {
  if (event.source !== globalThis.parent) return false;
  if (!Array.isArray(event.data)) return false;
  if (event.data.length < 2) return false;
  if (event.data[0] !== key) return false;
  return true;
}
