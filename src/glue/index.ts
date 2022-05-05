import { Buffer } from "https://deno.land/std@0.137.0/io/buffer.ts";
import { str2u8s } from "./misc.ts";

const key = "glue"; // TODO: use less conflicting name

export interface Glue {
  read(p: Uint8Array): Promise<number | null>;
  recv(data: Uint8Array | string): Promise<number>;
}
export function getGlue(): Glue {
  const global = globalThis as any;
  if (global[key]) return global[key];
  const buffer = new Buffer(new Uint8Array(1024));
  const glue: Glue = {
    read: (data) => buffer.read(data),
    recv: (data) =>
      buffer.write(typeof data === "string" ? str2u8s(data) : data),
  };
  return global[key] = glue;
}
