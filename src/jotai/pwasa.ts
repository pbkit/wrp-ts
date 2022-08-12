import { atom, PrimitiveAtom, useAtomValue } from "jotai";
import type { RpcClientImpl } from "https://deno.land/x/pbkit@v0.0.45/core/runtime/rpc.ts";
import { WrpChannel } from "../channel.ts";
import { WrpGuest } from "../guest.ts";
import { WrpAtomSet } from "./index.ts";

export type PrimitiveWrpAtomSetAtom = PrimitiveAtom<WrpAtomSet>;
export function createPrimitiveWrpAtomSetAtom(): PrimitiveWrpAtomSetAtom {
  return atom<WrpAtomSet>({
    channelAtom: atom(undefined),
    guestAtom: atom(undefined),
    clientImplAtom: atom(undefined),
  });
}
export function useChannel(
  primitiveWrpAtomSetAtom: PrimitiveAtom<WrpAtomSet>,
): WrpChannel | undefined {
  const wrpAtomSet = useAtomValue(primitiveWrpAtomSetAtom);
  const channel = useAtomValue(wrpAtomSet.channelAtom);
  return channel;
}
export function useGuest(
  primitiveWrpAtomSetAtom: PrimitiveAtom<WrpAtomSet>,
): WrpGuest | undefined {
  const wrpAtomSet = useAtomValue(primitiveWrpAtomSetAtom);
  const guest = useAtomValue(wrpAtomSet.guestAtom);
  return guest;
}
export function useClientImpl(
  primitiveWrpAtomSetAtom: PrimitiveAtom<WrpAtomSet>,
): RpcClientImpl | undefined {
  const wrpAtomSet = useAtomValue(primitiveWrpAtomSetAtom);
  const clientImpl = useAtomValue(wrpAtomSet.clientImplAtom);
  return clientImpl;
}
