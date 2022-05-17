import type { MethodDescriptor } from "https://deno.land/x/pbkit@v0.0.45/core/runtime/rpc.ts";

export async function* mapAsyncGenerator<T, U>(
  asyncGenerator: AsyncGenerator<T>,
  fn: (value: T) => U,
): AsyncGenerator<U> {
  for await (const value of asyncGenerator) yield fn(value);
}

export function getMethodName<
  TMethodName extends string,
  TServiceName extends string,
  TDescriptor extends MethodDescriptor<any, any, TMethodName, TServiceName>,
>(descriptor: TDescriptor): `${TServiceName}/${TMethodName}` {
  return `${descriptor.service.serviceName}/${descriptor.methodName}`;
}
