export function u8s2str(u8s: Uint8Array): string {
  return u8s.reduce((acc, curr) => acc + String.fromCharCode(curr), "");
}

export function str2u8s(str: string): Uint8Array {
  const u8s = new Uint8Array(str.length);
  for (let i = 0; i < str.length; ++i) u8s[i] = str.charCodeAt(i);
  return u8s;
}

export function checkAndRetryUntilSuccess<T>(
  checkFn: () => T | undefined,
  retryFn?: () => void,
  interval: number = 100,
  limit: number = 10,
): Promise<T> {
  return new Promise((resolve, reject) => {
    let count = 0;
    const intervalId = setInterval(() => {
      const result = checkFn();
      if (result !== undefined) {
        clearInterval(intervalId);
        resolve(result);
        return;
      }
      if (count++ < limit) {
        retryFn?.();
      } else {
        clearInterval(intervalId);
        reject(new Error("Exhausted all retries"));
      }
    }, interval);
  });
}
