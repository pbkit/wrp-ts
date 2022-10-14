import { Atom, atom, PrimitiveAtom } from "jotai";
import { selectAtom } from "jotai/utils";
import type { RpcClientImpl } from "https://deno.land/x/pbkit@v0.0.45/core/runtime/rpc.ts";
import { Type as WrpMessage } from "../generated/messages/pbkit/wrp/WrpMessage.ts";
import { Socket } from "../socket.ts";
import { createWrpChannel, WrpChannel } from "../channel.ts";
import { createWrpClientImpl } from "../rpc/client.ts";
import { createWrpGuest, WrpGuest } from "../guest.ts";

export type SocketAtom = PrimitiveSocketAtom | AsyncSocketAtom;
export type ChannelAtom = Atom<WrpChannel | undefined>;
export type GuestAtom = Atom<Promise<WrpGuest> | undefined>;
export type ClientImplAtom = Atom<RpcClientImpl | undefined>;

export type PrimitiveSocketAtom = PrimitiveAtom<Socket | undefined>;
export type AsyncSocketAtom = Atom<Promise<Socket | undefined>>;

export interface WrpAtomSet {
  channelAtom: ChannelAtom;
  guestAtom: GuestAtom;
  clientImplAtom: ClientImplAtom;
}
export function createWrpAtomSet(socketAtom: SocketAtom): WrpAtomSet {
  const channelAtom: ChannelAtom = atom((get) => {
    const socket = get(socketAtom);
    if (!socket) return;
    return createWrpChannel(socket);
  });
  return createWrpAtomSetFromSourceChannelAtom(channelAtom);
}

export function createWrpAtomSetFromSourceChannelAtom(
  sourceChannelAtom: ChannelAtom,
): WrpAtomSet {
  interface ChannelAndGuest {
    channel: WrpChannel;
    guest: Promise<WrpGuest>;
  }
  const channelAndGuestAtom = atom<Promise<ChannelAndGuest | undefined>>(
    async (get) => {
      const sourceChannel = get(sourceChannelAtom);
      if (!sourceChannel) return;
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
    },
  );
  const channelAtom = selectAtom(
    channelAndGuestAtom,
    (cag) => cag?.channel,
  );
  const guestAtom = selectAtom(
    channelAndGuestAtom,
    (cag) => cag?.guest,
  );
  const clientImplAtom = atom<RpcClientImpl | undefined>((get) => {
    const guest = get(guestAtom);
    if (!guest) return;
    return createWrpClientImpl({ guest: guest });
  });
  return { channelAtom, guestAtom, clientImplAtom };
}
