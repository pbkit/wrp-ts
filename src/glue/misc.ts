export function u8s2str(u8s: Uint8Array): string {
  return u8s.reduce((acc, curr) => acc + String.fromCharCode(curr), "");
}

export function str2u8s(str: string): Uint8Array {
  const u8s = new Uint8Array(str.length);
  for (let i = 0; i < str.length; ++i) u8s[i] = str.charCodeAt(i);
  return u8s;
}

export type TryFn<T> = () => T | undefined;
export function tryUntilSuccess<T>(
  fn: TryFn<T>,
  interval: number = 100,
  limit: number = 10,
): Promise<T> {
  return new Promise((resolve, reject) => {
    let count = 0;
    const intervalId = setInterval(() => {
      const result = fn();
      if (result !== undefined) {
        clearInterval(intervalId);
        resolve(result);
      } else if (++count >= limit) {
        clearInterval(intervalId);
        reject(new Error("Exhausted all retries"));
      }
    }, interval);
  });
}
