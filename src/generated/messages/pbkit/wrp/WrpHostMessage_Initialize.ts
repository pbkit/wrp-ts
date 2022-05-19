import {
  tsValueToJsonValueFns,
  jsonValueToTsValueFns,
} from "https://deno.land/x/pbkit@v0.0.45/core/runtime/json/scalar.ts";
import {
  WireMessage,
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
  export interface WrpHostMessage_Initialize {
    availableMethods: string[];
  }
}
export type Type = $.pbkit.wrp.WrpHostMessage_Initialize;

export function getDefaultValue(): $.pbkit.wrp.WrpHostMessage_Initialize {
  return {
    availableMethods: [],
  };
}

export function createValue(partialValue: Partial<$.pbkit.wrp.WrpHostMessage_Initialize>): $.pbkit.wrp.WrpHostMessage_Initialize {
  return {
    ...getDefaultValue(),
    ...partialValue,
  };
}

export function encodeJson(value: $.pbkit.wrp.WrpHostMessage_Initialize): unknown {
  const result: any = {};
  result.availableMethods = value.availableMethods.map(value => tsValueToJsonValueFns.string(value));
  return result;
}

export function decodeJson(value: any): $.pbkit.wrp.WrpHostMessage_Initialize {
  const result = getDefaultValue();
  result.availableMethods = value.availableMethods?.map((value: any) => jsonValueToTsValueFns.string(value)) ?? [];
  return result;
}

export function encodeBinary(value: $.pbkit.wrp.WrpHostMessage_Initialize): Uint8Array {
  const result: WireMessage = [];
  for (const tsValue of value.availableMethods) {
    result.push(
      [1, tsValueToWireValueFns.string(tsValue)],
    );
  }
  return serialize(result);
}

export function decodeBinary(binary: Uint8Array): $.pbkit.wrp.WrpHostMessage_Initialize {
  const result = getDefaultValue();
  const wireMessage = deserialize(binary);
  const wireFields = new Map(wireMessage);
  collection: {
    const wireValues = wireMessage.filter(([fieldNumber]) => fieldNumber === 1).map(([, wireValue]) => wireValue);
    const value = wireValues.map((wireValue) => wireValueToTsValueFns.string(wireValue)).filter(x => x !== undefined);
    if (!value.length) break collection;
    result.availableMethods = value as any;
  }
  return result;
}
