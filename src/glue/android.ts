import { Socket } from "../socket.ts";
import { checkAndRetryUntilSuccess, u8s2str } from "./misc.ts";
import { getGlue } from "./index.ts";

// https://developer.android.com/reference/android/webkit/WebView#addJavascriptInterface(java.lang.Object,%20java.lang.String)
// https://stackoverflow.com/a/45506857

const key = "<android-glue>";

export async function createAndroidSocket(): Promise<Socket> {
  const androidGlue = await getAndroidGlue();
  return {
    read: getGlue().read,
    async write(data) {
      androidGlue.recv(u8s2str(data));
      return data.byteLength;
    },
  };
}

interface AndroidGlue {
  recv(data: string): Promise<void>;
}
async function getAndroidGlue(): Promise<AndroidGlue> {
  return await checkAndRetryUntilSuccess(
    () => (globalThis as any)[key] || undefined,
  );
}
