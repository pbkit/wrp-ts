import {
  tsValueToJsonValueFns,
  jsonValueToTsValueFns,
} from "https:/deno.land/x/pbkit@v0.0.45/core/runtime/json/scalar.ts";
import {
  WireMessage,
  WireType,
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
  export interface WvrpGuestMessage_ReqStart {
    reqId: string;
    methodName: string;
    metadata: Map<string, string>;
  }
}
export type Type = $.pbkit.wvrp.WvrpGuestMessage_ReqStart;

export function getDefaultValue(): $.pbkit.wvrp.WvrpGuestMessage_ReqStart {
  return {
    reqId: "",
    methodName: "",
    metadata: new Map(),
  };
}

export function createValue(partialValue: Partial<$.pbkit.wvrp.WvrpGuestMessage_ReqStart>): $.pbkit.wvrp.WvrpGuestMessage_ReqStart {
  return {
    ...getDefaultValue(),
    ...partialValue,
  };
}

export function encodeJson(value: $.pbkit.wvrp.WvrpGuestMessage_ReqStart): unknown {
  const result: any = {};
  if (value.reqId !== undefined) result.reqId = tsValueToJsonValueFns.string(value.reqId);
  if (value.methodName !== undefined) result.methodName = tsValueToJsonValueFns.string(value.methodName);
  if (value.metadata !== undefined) result.metadata = Object.fromEntries([...value.metadata.entries()].map(([key, value]) => [key, tsValueToJsonValueFns.string(value)]));
  return result;
}

export function decodeJson(value: any): $.pbkit.wvrp.WvrpGuestMessage_ReqStart {
  const result = getDefaultValue();
  if (value.reqId !== undefined) result.reqId = jsonValueToTsValueFns.string(value.reqId);
  if (value.methodName !== undefined) result.methodName = jsonValueToTsValueFns.string(value.methodName);
  if (value.metadata !== undefined) result.metadata = Object.fromEntries([...value.metadata.entries()].map(([key, value]) => [key, jsonValueToTsValueFns.string(value)]));
  return result;
}

export function encodeBinary(value: $.pbkit.wvrp.WvrpGuestMessage_ReqStart): Uint8Array {
  const result: WireMessage = [];
  if (value.reqId !== undefined) {
    const tsValue = value.reqId;
    result.push(
      [1, tsValueToWireValueFns.string(tsValue)],
    );
  }
  if (value.methodName !== undefined) {
    const tsValue = value.methodName;
    result.push(
      [2, tsValueToWireValueFns.string(tsValue)],
    );
  }
  {
    const fields = value.metadata.entries();
    for (const [key, value] of fields) {
      result.push(
        [3, { type: WireType.LengthDelimited as const, value: serialize([[1, tsValueToWireValueFns.string(key)], [2, tsValueToWireValueFns.string(value)]]) }],
      );
    }
  }
  return serialize(result);
}

export function decodeBinary(binary: Uint8Array): $.pbkit.wvrp.WvrpGuestMessage_ReqStart {
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
    const value = wireValueToTsValueFns.string(wireValue);
    if (value === undefined) break field;
    result.methodName = value;
  }
  collection: {
    const wireValues = wireMessage.filter(([fieldNumber]) => fieldNumber === 3).map(([, wireValue]) => wireValue);
    const value = wireValues.map((wireValue) => (() => { if (wireValue.type !== WireType.LengthDelimited) { return; } const { 0: key, 1: value } = Object.fromEntries(deserialize(wireValue.value)); if (key === undefined || value === undefined) return; return [wireValueToTsValueFns.string(key), wireValueToTsValueFns.string(value)] as const;})()).filter(x => x !== undefined);
    if (!value.length) break collection;
    result.metadata = new Map(value as any);
  }
  return result;
}
