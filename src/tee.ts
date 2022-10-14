import { Type as WrpMessage } from "./generated/messages/pbkit/wrp/WrpMessage.ts";
import { WrpChannel } from "./channel.ts";
import { createWrpGuest, WrpGuest } from "./guest.ts";

export interface ChannelAndGuest {
  channel: WrpChannel;
  guest: Promise<WrpGuest>;
}
export default function tee(sourceChannel: WrpChannel): ChannelAndGuest {
  const listeners: ((message?: WrpMessage) => void)[] = [];
  const guest = createWrpGuest({
    channel: {
      ...sourceChannel,
      async *listen() {
        for await (const message of sourceChannel.listen()) {
          yield message;
          for (const listener of listeners) listener(message);
          listeners.length = 0;
        }
      },
    },
  });
  const channel: WrpChannel = {
    ...sourceChannel,
    async *listen() {
      while (true) {
        const message = await new Promise<WrpMessage | undefined>(
          (resolve) => listeners.push(resolve),
        );
        if (!message) break;
        yield message;
      }
    },
  };
  return { channel, guest };
}
