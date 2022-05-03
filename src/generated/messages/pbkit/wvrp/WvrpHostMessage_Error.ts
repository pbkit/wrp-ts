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
  export interface WvrpHostMessage_Error {
    message: string;
  }
}
export type Type = $.pbkit.wvrp.WvrpHostMessage_Error;

export function getDefaultValue(): $.pbkit.wvrp.WvrpHostMessage_Error {
  return {
    message: "",
  };
}

export function createValue(partialValue: Partial<$.pbkit.wvrp.WvrpHostMessage_Error>): $.pbkit.wvrp.WvrpHostMessage_Error {
  return {
    ...getDefaultValue(),
    ...partialValue,
  };
}

export function encodeJson(value: $.pbkit.wvrp.WvrpHostMessage_Error): unknown {
  const result: any = {};
  if (value.message !== undefined) result.message = tsValueToJsonValueFns.string(value.message);
  return result;
}

export function decodeJson(value: any): $.pbkit.wvrp.WvrpHostMessage_Error {
  const result = getDefaultValue();
  if (value.message !== undefined) result.message = jsonValueToTsValueFns.string(value.message);
  return result;
}

export function encodeBinary(value: $.pbkit.wvrp.WvrpHostMessage_Error): Uint8Array {
  const result: WireMessage = [];
  if (value.message !== undefined) {
    const tsValue = value.message;
    result.push(
      [1, tsValueToWireValueFns.string(tsValue)],
    );
  }
  return serialize(result);
}

export function decodeBinary(binary: Uint8Array): $.pbkit.wvrp.WvrpHostMessage_Error {
  const result = getDefaultValue();
  const wireMessage = deserialize(binary);
  const wireFields = new Map(wireMessage);
  field: {
    const wireValue = wireFields.get(1);
    if (wireValue === undefined) break field;
    const value = wireValueToTsValueFns.string(wireValue);
    if (value === undefined) break field;
    result.message = value;
  }
  return result;
}
