import { useEffect } from "react";
import { atom, PrimitiveAtom, useSetAtom } from "jotai";
import {
  createWrpAtomSetFromSourceChannelAtom,
  PrimitiveSocketAtom,
  WrpAtomSet,
} from "./index.ts";
import { Socket } from "../socket.ts";
import {
  createWrpChannel as createWrpChannelFn,
  WrpChannel,
} from "../channel.ts";
import {
  default as useWrpIframeSocket,
  UseWrpIframeSocketResult,
} from "../react/useWrpIframeSocket.ts";

export function useIframeWrpSocketAtomUpdateEffect(
  socketAtom: PrimitiveSocketAtom,
): UseWrpIframeSocketResult {
  const setSocket = useSetAtom(socketAtom);
  const useWrpIframeSocketResult = useWrpIframeSocket();
  const { socket } = useWrpIframeSocketResult;
  useEffect(() => {
    if (!socket) return;
    setSocket(socket);
  }, [socket]);
  return useWrpIframeSocketResult;
}

export function useIframeWrpAtomSetUpdateEffect(
  primitiveWrpAtomSetAtom: PrimitiveAtom<WrpAtomSet>,
  createWrpChannel: (socket: Socket) => WrpChannel = createWrpChannelFn,
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
