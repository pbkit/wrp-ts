export function chain<T extends (...args: any[]) => Promise<any>>(fn: T): T {
  let prev: Promise<any> | undefined;
  return function _fn(...args) {
    const curr = (prev || Promise.resolve())
      .then(() => fn(...args))
      .then((result) => {
        if (prev === curr) prev = undefined;
        return result;
      });
    return (prev = curr);
  } as T;
}
