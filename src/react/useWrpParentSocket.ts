import { useState } from "react";
import { Socket } from "../socket.ts";
import useOnceEffect from "../react/useOnceEffect.ts";
import { subscribeParentSocket } from "../glue/parent.ts";

export interface UseWrpParentSocketResult {
  socket: Socket | undefined;
  error: Error | undefined;
}
/**
 * @deprecated use `@pbkit/wrp-jotai/parent` instead
 */
export default function useWrpParentSocket(): UseWrpParentSocketResult {
  const [socket, setSocket] = useState<Socket | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  useOnceEffect(() =>
    subscribeParentSocket((socket, error) => {
      setSocket(socket);
      setError(error);
    })
  );
  return { socket, error };
}
