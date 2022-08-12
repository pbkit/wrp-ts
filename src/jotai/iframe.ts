import { useEffect } from "react";
import { atom, PrimitiveAtom, useSetAtom } from "jotai";
import { createWrpAtomSet, WrpAtomSet } from "./index.ts";
import {
  default as useWrpIframeSocket,
  UseWrpIframeSocketResult,
} from "../react/useWrpIframeSocket.ts";

export function useIframeWrpAtomSetUpdateEffect(
  primitiveWrpAtomSetAtom: PrimitiveAtom<WrpAtomSet>,
): UseWrpIframeSocketResult {
  const setIframeAtomSet = useSetAtom(primitiveWrpAtomSetAtom);
  const useWrpIframeSocketResult = useWrpIframeSocket();
  const { socket } = useWrpIframeSocketResult;
  useEffect(() => {
    if (!socket) return;
    const socketAtom = atom(async () => socket);
    setIframeAtomSet(createWrpAtomSet(socketAtom));
  }, [socket]);
  return useWrpIframeSocketResult;
}
