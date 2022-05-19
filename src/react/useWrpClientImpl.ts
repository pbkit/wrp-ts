import type { RpcClientImpl } from "https://deno.land/x/pbkit@v0.0.45/core/runtime/rpc.ts";
import { useEffect, useState } from "react";
import { WrpChannel } from "../channel.ts";
import { createWrpGuest } from "../guest.ts";
import { createWrpClientImpl } from "../rpc/client.ts";

export default function useWrpClientImpl(
  channel: WrpChannel | undefined,
): ReturnType<typeof createWrpClientImpl> | undefined {
  const [
    clientImpl,
    setClientImpl,
  ] = useState<RpcClientImpl | undefined>(undefined);
  useEffect(() => {
    if (!channel) return;
    createWrpGuest({ channel }).then(
      (guest) => setClientImpl(() => createWrpClientImpl({ guest })),
    );
  }, [channel]);
  return clientImpl;
}
