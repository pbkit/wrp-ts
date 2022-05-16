import type { RpcClientImpl } from "https://deno.land/x/pbkit@v0.0.45/core/runtime/rpc.ts";
import type { WrpGuest } from "../guest.ts";
import type { LazyMetadata, Metadata } from "../metadata.ts";
import { mapAsyncGenerator } from "./misc.ts";

export interface CreateWrpClientImplConfig {
  guest: WrpGuest;
  metadata?: LazyMetadata;
}

export class WrpClientError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export function createWrpClientImpl(
  config: CreateWrpClientImplConfig,
): RpcClientImpl<LazyMetadata, Metadata, Metadata> {
  return (methodDescriptor) => {
    const { methodName, requestType, responseType } = methodDescriptor;
    if (!config.guest.availableMethods.has(methodName)) {
      return () => {
        throw new WrpClientError("Method not available");
      };
    }
    return (req, metadata) => {
      const { res, header, trailer } = config.guest.request(
        methodName,
        mapAsyncGenerator(req, requestType.serializeBinary),
        { ...config.metadata, ...metadata },
      );
      const _res = mapAsyncGenerator(res, responseType.deserializeBinary);
      return [_res, header, trailer];
    };
  };
}
