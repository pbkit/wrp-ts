import { Buffer } from "https://deno.land/std@0.122.0/io/buffer.ts";
import { Socket } from "../socket.ts";
import { str2u8s } from "./misc.ts";

declare global {
  interface Window {
    webkit?: {
      messageHandlers?: {
        glue?: {
          postMessage(message: {
            data: Uint8Array;
          }): Promise<void>;
        };
      };
    };
    glue: WebGlue;
  }
}

interface WebGlue {
  read(p: Uint8Array): Promise<number | null>;
  recv(data: string): Promise<number>;
}
export function registerWebGlue() {
  const buf = new Buffer(new Uint8Array(1024));
  Object.assign(window, {
    glue: {
      read(p: Uint8Array) {
        return buf.read(p);
      },
      recv(data: string) {
        return buf.write(str2u8s(data));
      },
    },
  });
}

export async function createIosSocket() {
  return new Promise<Socket>((resolve, reject) => {
    const glue = window.webkit?.messageHandlers?.glue;
    if (!glue) reject(new Error("No glue in messageHandlers")); // Retry strategy for this?
    return resolve({
      read(p) {
        return window.glue.read(p);
      },
      async write(p) {
        if (!glue) throw new Error("Unreachable code");
        return glue.postMessage({ data: p }).then(() => {
          return p.byteLength;
        });
      },
    });
  });
}
