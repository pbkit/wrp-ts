import type { WrpMessage } from "./generated/messages/pbkit/wrp/index.ts";

export type Socket = Deno.Reader & Deno.Writer;

export interface WrpChannel {
  listen(): AsyncGenerator<WrpMessage>;
  send(message: WrpMessage): Promise<void>;
}
export async function createWrpChannel(socket: Socket): Promise<WrpChannel> {
  return {
    async *listen() {}, // TODO
    async send(message) {}, // TODO
  };
}
