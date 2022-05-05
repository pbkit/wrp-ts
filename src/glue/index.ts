import {
  defer,
  Deferred,
} from "https://deno.land/x/pbkit@v0.0.45/core/runtime/async/observer.ts";
import { chain } from "../misc.ts";
import { str2u8s } from "./misc.ts";

const key = "<glue>";

export interface Glue extends Deno.Reader {
  recv(data: Uint8Array | string): void;
}
export function getGlue(): Glue {
  const global = globalThis as any;
  if (global[key]) return global[key];
  const queue: Uint8Array[] = [];
  let wait: Deferred<void> | undefined;
  const glue: Glue = {
    recv: (data) => {
      queue.push(typeof data === "string" ? str2u8s(data) : data);
      wait?.resolve();
    },
    read: chain(async (data) => {
      if (queue.length < 1) {
        await (wait = defer());
        wait = undefined;
      }
      const first = queue[0];
      if (first.length <= data.length) {
        queue.shift();
        data.set(first);
        return first.length;
      }
      data.set(first.subarray(0, data.length));
      queue[0] = first.subarray(data.length);
      return data.length;
    }),
  };
  return global[key] = glue;
}
