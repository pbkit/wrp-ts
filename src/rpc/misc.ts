export async function* mapAsyncGenerator<T, U>(
  asyncGenerator: AsyncGenerator<T>,
  fn: (value: T) => U,
): AsyncGenerator<U> {
  for await (const value of asyncGenerator) yield fn(value);
}
