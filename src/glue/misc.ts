export function u8s2str(u8s: Uint8Array): string {
  return Array.from(u8s).map((u8) => String.fromCharCode(u8)).join("");
}

export function str2u8s(str: string): Uint8Array {
  return new Uint8Array(
    Array.from(str).map((char) => {
      const code = char.codePointAt(0);
      if (code == null) throw new Error("Unexpected character");
      return code;
    }),
  );
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
