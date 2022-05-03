import {
  tsValueToJsonValueFns,
  jsonValueToTsValueFns,
} from "https:/deno.land/x/pbkit@v0.0.45/core/runtime/json/scalar.ts";
import {
  WireMessage,
} from "https:/deno.land/x/pbkit@v0.0.45/core/runtime/wire/index.ts";
import {
  default as serialize,
} from "https:/deno.land/x/pbkit@v0.0.45/core/runtime/wire/serialize.ts";
import {
  tsValueToWireValueFns,
  wireValueToTsValueFns,
} from "https:/deno.land/x/pbkit@v0.0.45/core/runtime/wire/scalar.ts";
import {
  default as deserialize,
} from "https:/deno.land/x/pbkit@v0.0.45/core/runtime/wire/deserialize.ts";

export declare namespace $.pbkit.wvrp {
  export interface WvrpHostMessage_ResPayload {
    reqId: string;
    payload: Uint8Array;
  }
}
export type Type = $.pbkit.wvrp.WvrpHostMessage_ResPayload;

export function getDefaultValue(): $.pbkit.wvrp.WvrpHostMessage_ResPayload {
  return {
    reqId: "",
    payload: new Uint8Array(),
  };
}

export function createValue(partialValue: Partial<$.pbkit.wvrp.WvrpHostMessage_ResPayload>): $.pbkit.wvrp.WvrpHostMessage_ResPayload {
  return {
    ...getDefaultValue(),
    ...partialValue,
  };
}

export function encodeJson(value: $.pbkit.wvrp.WvrpHostMessage_ResPayload): unknown {
  const result: any = {};
  if (value.reqId !== undefined) result.reqId = tsValueToJsonValueFns.string(value.reqId);
  if (value.payload !== undefined) result.payload = tsValueToJsonValueFns.bytes(value.payload);
  return result;
}

export function decodeJson(value: any): $.pbkit.wvrp.WvrpHostMessage_ResPayload {
  const result = getDefaultValue();
  if (value.reqId !== undefined) result.reqId = jsonValueToTsValueFns.string(value.reqId);
  if (value.payload !== undefined) result.payload = jsonValueToTsValueFns.bytes(value.payload);
  return result;
}

export function encodeBinary(value: $.pbkit.wvrp.WvrpHostMessage_ResPayload): Uint8Array {
  const result: WireMessage = [];
  if (value.reqId !== undefined) {
    const tsValue = value.reqId;
    result.push(
      [1, tsValueToWireValueFns.string(tsValue)],
    );
  }
  if (value.payload !== undefined) {
    const tsValue = value.payload;
    result.push(
      [2, tsValueToWireValueFns.bytes(tsValue)],
    );
  }
  return serialize(result);
}

export function decodeBinary(binary: Uint8Array): $.pbkit.wvrp.WvrpHostMessage_ResPayload {
  const result = getDefaultValue();
  const wireMessage = deserialize(binary);
  const wireFields = new Map(wireMessage);
  field: {
    const wireValue = wireFields.get(1);
    if (wireValue === undefined) break field;
    const value = wireValueToTsValueFns.string(wireValue);
    if (value === undefined) break field;
    result.reqId = value;
  }
  field: {
    const wireValue = wireFields.get(2);
    if (wireValue === undefined) break field;
    const value = wireValueToTsValueFns.bytes(wireValue);
    if (value === undefined) break field;
    result.payload = value;
  }
  return result;
}
