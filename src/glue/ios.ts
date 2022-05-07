import { Socket } from "../socket.ts";
import { checkAndRetryUntilSuccess } from "./misc.ts";
import { getGlue } from "./index.ts";

// https://developer.apple.com/documentation/webkit/wkusercontentcontroller/1537172-add

export async function createIosSocket(): Promise<Socket> {
  const iosGlue = await getIosGlue();
  return {
    read: getGlue().read,
    async write(data) {
      return iosGlue.postMessage({ data }).then(() => data.byteLength);
    },
  };
}

interface IosGlue {
  postMessage(message: { data: Uint8Array }): Promise<void>;
}
async function getIosGlue(): Promise<IosGlue> {
  return await checkAndRetryUntilSuccess(
    () => (globalThis as any).webkit?.messageHandlers?.glue || undefined,
  );
}
