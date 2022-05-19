import {
  tsValueToJsonValueFns,
  jsonValueToTsValueFns,
} from "https://deno.land/x/pbkit@v0.0.45/core/runtime/json/scalar.ts";
import {
  WireMessage,
  WireType,
} from "https://deno.land/x/pbkit@v0.0.45/core/runtime/wire/index.ts";
import {
  default as serialize,
} from "https://deno.land/x/pbkit@v0.0.45/core/runtime/wire/serialize.ts";
import {
  tsValueToWireValueFns,
  wireValueToTsValueFns,
} from "https://deno.land/x/pbkit@v0.0.45/core/runtime/wire/scalar.ts";
import {
  default as deserialize,
} from "https://deno.land/x/pbkit@v0.0.45/core/runtime/wire/deserialize.ts";

export declare namespace $.pbkit.wrp {
  export interface WrpHostMessage_ResStart {
    reqId: string;
    header: Map<string, string>;
  }
}
export type Type = $.pbkit.wrp.WrpHostMessage_ResStart;

export function getDefaultValue(): $.pbkit.wrp.WrpHostMessage_ResStart {
  return {
    reqId: "",
    header: new Map(),
  };
}

export function createValue(partialValue: Partial<$.pbkit.wrp.WrpHostMessage_ResStart>): $.pbkit.wrp.WrpHostMessage_ResStart {
  return {
    ...getDefaultValue(),
    ...partialValue,
  };
}

export function encodeJson(value: $.pbkit.wrp.WrpHostMessage_ResStart): unknown {
  const result: any = {};
  if (value.reqId !== undefined) result.reqId = tsValueToJsonValueFns.string(value.reqId);
  if (value.header !== undefined) result.header = Object.fromEntries([...value.header.entries()].map(([key, value]) => [key, tsValueToJsonValueFns.string(value)]));
  return result;
}

export function decodeJson(value: any): $.pbkit.wrp.WrpHostMessage_ResStart {
  const result = getDefaultValue();
  if (value.reqId !== undefined) result.reqId = jsonValueToTsValueFns.string(value.reqId);
  if (value.header !== undefined) result.header = Object.fromEntries([...value.header.entries()].map(([key, value]) => [key, jsonValueToTsValueFns.string(value)]));
  return result;
}

export function encodeBinary(value: $.pbkit.wrp.WrpHostMessage_ResStart): Uint8Array {
  const result: WireMessage = [];
  if (value.reqId !== undefined) {
    const tsValue = value.reqId;
    result.push(
      [1, tsValueToWireValueFns.string(tsValue)],
    );
  }
  {
    const fields = value.header.entries();
    for (const [key, value] of fields) {
      result.push(
        [2, { type: WireType.LengthDelimited as const, value: serialize([[1, tsValueToWireValueFns.string(key)], [2, tsValueToWireValueFns.string(value)]]) }],
      );
    }
  }
  return serialize(result);
}

export function decodeBinary(binary: Uint8Array): $.pbkit.wrp.WrpHostMessage_ResStart {
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
  collection: {
    const wireValues = wireMessage.filter(([fieldNumber]) => fieldNumber === 2).map(([, wireValue]) => wireValue);
    const value = wireValues.map((wireValue) => (() => { if (wireValue.type !== WireType.LengthDelimited) { return; } const { 1: key, 2: value } = Object.fromEntries(deserialize(wireValue.value)); if (key === undefined || value === undefined) return; return [wireValueToTsValueFns.string(key), wireValueToTsValueFns.string(value)] as const;})()).filter(x => x !== undefined);
    if (!value.length) break collection;
    result.header = new Map(value as any);
  }
  return result;
}
