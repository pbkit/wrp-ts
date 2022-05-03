import type { WvrpMessage } from "./generated/messages/pbkit/wvrp/index.ts";

export type Socket = Deno.Reader & Deno.Writer;

export interface WvrpChannel {
  listen(): AsyncGenerator<WvrpMessage>;
  send(message: WvrpMessage): Promise<void>;
}
export async function createWvrpChannel(socket: Socket): Promise<WvrpChannel> {
  return {
    async *listen() {}, // TODO
    async send(message) {}, // TODO
  };
}
