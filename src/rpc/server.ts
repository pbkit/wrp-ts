import {
  createServerImplBuilder,
  Method,
} from "https://deno.land/x/pbkit@v0.0.45/core/runtime/rpc.ts";
import type { WrpHost } from "../host.ts";
import type { Metadata } from "../metadata.ts";
import { getMethodName, mapAsyncGenerator } from "./misc.ts";

export interface CreateWrpServerConfig {
  host: WrpHost;
  methods: AsyncGenerator<Method<Metadata, Metadata, Metadata>>;
}
export async function createWrpServer(config: CreateWrpServerConfig) {
  const methods: {
    [methodName: string]: Method<Metadata, Metadata, Metadata>;
  } = {};
  for await (const method of config.methods) {
    const methodName = getMethodName(method[0]);
    methods[methodName] = method;
  }
  return {
    async listen() {
      for await (const request of config.host.listen()) {
        const method = methods[request.methodName];
        const sendHeader = doOnce(request.sendHeader);
        const sendTrailer = doOnce(request.sendTrailer);
        if (!method) {
          sendHeader({});
          sendTrailer({
            "wrp-status": "error",
            "wrp-message": `Method not found: ${request.methodName}`,
          });
          continue;
        }
        const [methodDescriptor, methodImpl] = method;
        const { req } = request;
        const { requestType, responseType } = methodDescriptor;
        const [res, header, trailer] = methodImpl(
          mapAsyncGenerator(req, requestType.deserializeBinary),
          request.metadata,
        );
        (async function () {
          let _header: Metadata = {};
          try {
            sendHeader(_header = await header);
            for await (const value of res) {
              request.sendPayload(responseType.serializeBinary(value));
            }
            sendTrailer(await trailer);
          } catch (err) {
            sendHeader(_header);
            sendTrailer({
              "wrp-status": "error",
              "wrp-message": err?.message ?? "",
            });
          }
        })();
      }
    },
  };
}

export function createWrpServerImplBuilder() {
  return createServerImplBuilder<Metadata, Metadata, Metadata>();
}

function doOnce<T extends (...args: any) => any>(fn: T) {
  let flag = false;
  return (...args: Parameters<T>) => {
    if (flag) return;
    flag = true;
    return fn.apply(null, args);
  };
}
