import { useEffect, useState } from "react";
import { Socket } from "../socket.ts";
import { createAndroidSocket } from "../glue/android.ts";
import { createIosSocket } from "../glue/ios.ts";
import { createParentWindowSocket } from "../glue/parent-window.ts";

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
  useEffect(() => {
    Promise.any([
      createAndroidSocket(),
      createIosSocket(),
      createParentWindowSocket({ parentWindowOrigin: "*" }),
    ]).then(setSocket).catch(setError);
  }, []);
  return { socket, error };
}
