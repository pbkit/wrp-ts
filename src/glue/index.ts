import {
  defer,
  Deferred,
} from "https://deno.land/x/pbkit@v0.0.45/core/runtime/async/observer.ts";
import { Closer, Reader } from "../socket.ts";
import { chain } from "../misc.ts";
import { str2u8s } from "./misc.ts";

const key = "<glue>";

export interface Glue extends Closer, Reader {
  recv(data: Uint8Array | string): void;
}

export function getGlue(): Glue {
  const global = globalThis as any;
  if (global[key]) return global[key];
  return global[key] = createGlue();
}

export function createGlue(): Glue {
  const queue: Uint8Array[] = [];
  let closed = false;
  let wait: Deferred<void> | undefined;
  return {
    close() {
      closed = true;
      wait?.resolve();
    },
    recv: (data) => {
      if (closed) throw new Error("Glue has been closed.");
      queue.push(typeof data === "string" ? str2u8s(data) : data);
      wait?.resolve();
    },
    read: chain(async (data) => {
      if (queue.length < 1) {
        if (closed) return null;
        await (wait = defer());
        wait = undefined;
      }
      const first = queue[0];
      if (first.byteLength <= data.byteLength) {
        queue.shift();
        data.set(first);
        return first.byteLength;
      }
      data.set(first.subarray(0, data.byteLength));
      queue[0] = first.subarray(data.byteLength);
      return data.byteLength;
    }),
  };
}

// for postMessage approach
export interface GlueEvent {
  data: [
    glueKey: typeof key,
    isHandshakeMessage: boolean,
    payload: Uint8Array | string,
  ];
  source: typeof globalThis | Window;
}
export function isGlueEvent(event: any): event is GlueEvent {
  if (!Array.isArray(event.data)) return false;
  if (event.data.length < 3) return false;
  if (event.data[0] !== key) return false;
  return true;
}
