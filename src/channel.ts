import {
  BufReader,
  BufWriter,
} from "https://deno.land/std@0.137.0/io/buffer.ts";
import {
  decodeBinary,
  encodeBinary,
  Type as WrpMessage,
} from "./generated/messages/pbkit/wrp/WrpMessage.ts";
import { Socket } from "./socket.ts";
import { chain } from "./misc.ts";

export interface WrpChannel {
  listen(): AsyncGenerator<WrpMessage>;
  send(message: WrpMessage): Promise<void>;
}
export function createWrpChannel(socket: Socket): WrpChannel {
  return {
    async *listen() {
      const bufReader = new BufReader(socket);
      while (true) {
        const lengthU8s = await bufReader.readFull(new Uint8Array(4));
        if (!lengthU8s) break;
        const length = new DataView(lengthU8s.buffer).getUint32(0, true);
        const payload = await bufReader.readFull(new Uint8Array(length));
        if (!payload) throw new Deno.errors.UnexpectedEof();
        yield decodeBinary(payload);
      }
    },
    send: chain(async function send(message) {
      const payload = encodeBinary(message);
      const lengthU8s = new Uint8Array(4);
      new DataView(lengthU8s.buffer).setUint32(0, payload.length, true);
      const bufWriter = new BufWriter(socket);
      await bufWriter.write(lengthU8s);
      await bufWriter.write(payload);
      await bufWriter.flush();
    }),
  };
}
