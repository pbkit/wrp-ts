import { defer } from "https://deno.land/x/pbkit@v0.0.45/core/runtime/async/observer.ts";
import { Socket } from "../socket.ts";
import { getGlue } from "./index.ts";

// https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API
// https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage

const global = globalThis as any;
const key = "<glue>";

export interface CreateParentWindowSocketConfig {
  parentWindowOrigin: string;
}
export async function createParentWindowSocket(
  config: CreateParentWindowSocketConfig,
): Promise<Socket> {
  if (global.top === global.self) throw new Error("This is the top.");
  if (!("parent" in global) || !global.parent?.postMessage) {
    throw new Error("There is no parent window.");
  }
  await handshake();
  const glue = getGlue();
  global.addEventListener("message", (event: any) => {
    if (!isGlueEvent(event)) return;
    glue.recv(event.data[1]);
  });
  return {
    read: glue.read,
    async write(data) {
      global.parent.postMessage(
        [key, data],
        config.parentWindowOrigin,
        [data.buffer],
      );
      return data.byteLength;
    },
  };
}

function handshake(): Promise<void> {
  const wait = defer<void>();
  global.addEventListener("message", handshakeHandler);
  return wait;
  function handshakeHandler(event: any) {
    if (!isGlueEvent(event)) return;
    if (event.data[1] === "ping") {
      global.parent.postMessage([key, "pong"]);
      global.removeEventListener("message", handshakeHandler);
      wait.resolve();
    }
  }
}

interface GlueEvent {
  data: [typeof key, Uint8Array | string];
}
function isGlueEvent(event: any): event is GlueEvent {
  if (event.source !== global.parent) return false;
  if (!Array.isArray(event.data)) return false;
  if (event.data.length < 2) return false;
  if (event.data[0] !== key) return false;
  return true;
}
