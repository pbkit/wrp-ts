import { useEffect } from "react";
import { atom, PrimitiveAtom, useSetAtom } from "jotai";
import { createWrpAtomSetFromSourceChannelAtom, WrpAtomSet } from "./index.ts";
import { createWrpChannel as createWrpChannelFn } from "../channel.ts";
import {
  default as useWrpIframeSocket,
  UseWrpIframeSocketResult,
} from "../react/useWrpIframeSocket.ts";

export function useIframeWrpAtomSetUpdateEffect(
  primitiveWrpAtomSetAtom: PrimitiveAtom<WrpAtomSet>,
  createWrpChannel = createWrpChannelFn,
): UseWrpIframeSocketResult {
  const setIframeAtomSet = useSetAtom(primitiveWrpAtomSetAtom);
  const useWrpIframeSocketResult = useWrpIframeSocket();
  const { socket } = useWrpIframeSocketResult;
  useEffect(() => {
    if (!socket) return;
    const channelAtom = atom(createWrpChannel(socket));
    setIframeAtomSet(createWrpAtomSetFromSourceChannelAtom(channelAtom));
  }, [socket]);
  return useWrpIframeSocketResult;
}
