import { defer } from "https://deno.land/x/pbkit@v0.0.45/core/runtime/async/observer.ts";
import { Socket } from "../socket.ts";
import { getGlue, isGlueEvent } from "./index.ts";

// https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API
// https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage

const key = "<glue>";

export interface CreateParentWindowSocketConfig {
  parent?: Window | null;
  parentWindowOrigin: string;
}
export async function createParentWindowSocket(
  config: CreateParentWindowSocketConfig,
): Promise<Socket> {
  const { parent = globalThis.parent, parentWindowOrigin } = config;
  if (!parent?.postMessage) throw new Error("There is no parent window.");
  if (parent === globalThis.self) throw new Error("Invalid parent window.");
  const wait = defer<void>();
  const glue = getGlue();
  globalThis.addEventListener("message", (event: any) => {
    if (event.source !== parent) return;
    if (!isGlueEvent(event)) return;
    const [, isHandshakeMessage, payload] = event.data;
    if (isHandshakeMessage) {
      if (payload === "ping") {
        parent.postMessage([key, true, "pong"], "*");
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
      const { postMessage } = parent;
      postMessage([key, false, data], parentWindowOrigin, [data.buffer]);
      return length;
    },
  };
}
