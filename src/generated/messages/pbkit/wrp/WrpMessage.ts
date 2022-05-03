import {
  Type as WrpHostMessage_Initialize,
  encodeJson as encodeJson_1,
  decodeJson as decodeJson_1,
  encodeBinary as encodeBinary_1,
  decodeBinary as decodeBinary_1,
} from "./WrpHostMessage_Initialize.ts";
import {
  Type as WrpHostMessage_Error,
  encodeJson as encodeJson_2,
  decodeJson as decodeJson_2,
  encodeBinary as encodeBinary_2,
  decodeBinary as decodeBinary_2,
} from "./WrpHostMessage_Error.ts";
import {
  Type as WrpHostMessage_ResStart,
  encodeJson as encodeJson_3,
  decodeJson as decodeJson_3,
  encodeBinary as encodeBinary_3,
  decodeBinary as decodeBinary_3,
} from "./WrpHostMessage_ResStart.ts";
import {
  Type as WrpHostMessage_ResPayload,
  encodeJson as encodeJson_4,
  decodeJson as decodeJson_4,
  encodeBinary as encodeBinary_4,
  decodeBinary as decodeBinary_4,
} from "./WrpHostMessage_ResPayload.ts";
import {
  Type as WrpHostMessage_ResFinish,
  encodeJson as encodeJson_5,
  decodeJson as decodeJson_5,
  encodeBinary as encodeBinary_5,
  decodeBinary as decodeBinary_5,
} from "./WrpHostMessage_ResFinish.ts";
import {
  Type as WrpGuestMessage_ReqStart,
  encodeJson as encodeJson_6,
  decodeJson as decodeJson_6,
  encodeBinary as encodeBinary_6,
  decodeBinary as decodeBinary_6,
} from "./WrpGuestMessage_ReqStart.ts";
import {
  Type as WrpGuestMessage_ReqPayload,
  encodeJson as encodeJson_7,
  decodeJson as decodeJson_7,
  encodeBinary as encodeBinary_7,
  decodeBinary as decodeBinary_7,
} from "./WrpGuestMessage_ReqPayload.ts";
import {
  Type as WrpGuestMessage_ReqFinish,
  encodeJson as encodeJson_8,
  decodeJson as decodeJson_8,
  encodeBinary as encodeBinary_8,
  decodeBinary as decodeBinary_8,
} from "./WrpGuestMessage_ReqFinish.ts";
import {
  jsonValueToTsValueFns,
} from "https:/deno.land/x/pbkit@v0.0.45/core/runtime/json/scalar.ts";
import {
  WireMessage,
  WireType,
  Field,
} from "https:/deno.land/x/pbkit@v0.0.45/core/runtime/wire/index.ts";
import {
  default as serialize,
} from "https:/deno.land/x/pbkit@v0.0.45/core/runtime/wire/serialize.ts";
import {
  default as deserialize,
} from "https:/deno.land/x/pbkit@v0.0.45/core/runtime/wire/deserialize.ts";

export declare namespace $.pbkit.wrp {
  export interface WrpMessage {
    message?: (
      | { field: "HostInitialize", value: WrpHostMessage_Initialize }
      | { field: "HostError", value: WrpHostMessage_Error }
      | { field: "HostResStart", value: WrpHostMessage_ResStart }
      | { field: "HostResPayload", value: WrpHostMessage_ResPayload }
      | { field: "HostResFinish", value: WrpHostMessage_ResFinish }
      | { field: "GuestReqStart", value: WrpGuestMessage_ReqStart }
      | { field: "GuestReqPayload", value: WrpGuestMessage_ReqPayload }
      | { field: "GuestReqFinish", value: WrpGuestMessage_ReqFinish }
  );
  }
}
export type Type = $.pbkit.wrp.WrpMessage;

export function getDefaultValue(): $.pbkit.wrp.WrpMessage {
  return {
    message: undefined,
  };
}

export function createValue(partialValue: Partial<$.pbkit.wrp.WrpMessage>): $.pbkit.wrp.WrpMessage {
  return {
    ...getDefaultValue(),
    ...partialValue,
  };
}

export function encodeJson(value: $.pbkit.wrp.WrpMessage): unknown {
  const result: any = {};
  switch (value.message?.field) {
    case "HostInitialize": {
      result.HostInitialize = encodeJson_1(value.message.value);
      break;
    }
    case "HostError": {
      result.HostError = encodeJson_2(value.message.value);
      break;
    }
    case "HostResStart": {
      result.HostResStart = encodeJson_3(value.message.value);
      break;
    }
    case "HostResPayload": {
      result.HostResPayload = encodeJson_4(value.message.value);
      break;
    }
    case "HostResFinish": {
      result.HostResFinish = encodeJson_5(value.message.value);
      break;
    }
    case "GuestReqStart": {
      result.GuestReqStart = encodeJson_6(value.message.value);
      break;
    }
    case "GuestReqPayload": {
      result.GuestReqPayload = encodeJson_7(value.message.value);
      break;
    }
    case "GuestReqFinish": {
      result.GuestReqFinish = encodeJson_8(value.message.value);
      break;
    }
  }
  return result;
}

export function decodeJson(value: any): $.pbkit.wrp.WrpMessage {
  const result = getDefaultValue();
  if (value.HostInitialize !== undefined) result.message = {field: "HostInitialize", value: decodeJson_1(value.HostInitialize)};
  if (value.HostError !== undefined) result.message = {field: "HostError", value: decodeJson_2(value.HostError)};
  if (value.HostResStart !== undefined) result.message = {field: "HostResStart", value: decodeJson_3(value.HostResStart)};
  if (value.HostResPayload !== undefined) result.message = {field: "HostResPayload", value: decodeJson_4(value.HostResPayload)};
  if (value.HostResFinish !== undefined) result.message = {field: "HostResFinish", value: decodeJson_5(value.HostResFinish)};
  if (value.GuestReqStart !== undefined) result.message = {field: "GuestReqStart", value: decodeJson_6(value.GuestReqStart)};
  if (value.GuestReqPayload !== undefined) result.message = {field: "GuestReqPayload", value: decodeJson_7(value.GuestReqPayload)};
  if (value.GuestReqFinish !== undefined) result.message = {field: "GuestReqFinish", value: decodeJson_8(value.GuestReqFinish)};
  return result;
}

export function encodeBinary(value: $.pbkit.wrp.WrpMessage): Uint8Array {
  const result: WireMessage = [];
  switch (value.message?.field) {
    case "HostInitialize": {
      const tsValue = value.message.value;
      result.push(
        [1, { type: WireType.LengthDelimited as const, value: encodeBinary_1(tsValue) }],
      );
      break;
    }
    case "HostError": {
      const tsValue = value.message.value;
      result.push(
        [2, { type: WireType.LengthDelimited as const, value: encodeBinary_2(tsValue) }],
      );
      break;
    }
    case "HostResStart": {
      const tsValue = value.message.value;
      result.push(
        [3, { type: WireType.LengthDelimited as const, value: encodeBinary_3(tsValue) }],
      );
      break;
    }
    case "HostResPayload": {
      const tsValue = value.message.value;
      result.push(
        [4, { type: WireType.LengthDelimited as const, value: encodeBinary_4(tsValue) }],
      );
      break;
    }
    case "HostResFinish": {
      const tsValue = value.message.value;
      result.push(
        [5, { type: WireType.LengthDelimited as const, value: encodeBinary_5(tsValue) }],
      );
      break;
    }
    case "GuestReqStart": {
      const tsValue = value.message.value;
      result.push(
        [6, { type: WireType.LengthDelimited as const, value: encodeBinary_6(tsValue) }],
      );
      break;
    }
    case "GuestReqPayload": {
      const tsValue = value.message.value;
      result.push(
        [7, { type: WireType.LengthDelimited as const, value: encodeBinary_7(tsValue) }],
      );
      break;
    }
    case "GuestReqFinish": {
      const tsValue = value.message.value;
      result.push(
        [8, { type: WireType.LengthDelimited as const, value: encodeBinary_8(tsValue) }],
      );
      break;
    }
  }
  return serialize(result);
}

const fieldNames: Map<number, string> = new Map([
  [1, "HostInitialize"],
  [2, "HostError"],
  [3, "HostResStart"],
  [4, "HostResPayload"],
  [5, "HostResFinish"],
  [6, "GuestReqStart"],
  [7, "GuestReqPayload"],
  [8, "GuestReqFinish"],
]);
const oneofFieldNumbersMap: { [oneof: string]: Set<number> } = {
  message: new Set([1, 2, 3, 4, 5, 6, 7, 8]),
};
const oneofFieldNamesMap = {
  message: new Map([
    [1, "HostInitialize" as const],
    [2, "HostError" as const],
    [3, "HostResStart" as const],
    [4, "HostResPayload" as const],
    [5, "HostResFinish" as const],
    [6, "GuestReqStart" as const],
    [7, "GuestReqPayload" as const],
    [8, "GuestReqFinish" as const],
  ]),
};
export function decodeBinary(binary: Uint8Array): $.pbkit.wrp.WrpMessage {
  const result = getDefaultValue();
  const wireMessage = deserialize(binary);
  const wireFields = new Map(wireMessage);
  const wireFieldNumbers = Array.from(wireFields.keys()).reverse();
  oneof: {
    const oneofFieldNumbers = oneofFieldNumbersMap.message;
    const oneofFieldNames = oneofFieldNamesMap.message;
    const fieldNumber = wireFieldNumbers.find(v => oneofFieldNumbers.has(v));
    if (fieldNumber == null) break oneof;
    const wireValue = wireFields.get(fieldNumber);
    const wireValueToTsValueMap = {
      [1](wireValue: Field) { return wireValue.type === WireType.LengthDelimited ? decodeBinary_1(wireValue.value) : undefined; },
      [2](wireValue: Field) { return wireValue.type === WireType.LengthDelimited ? decodeBinary_2(wireValue.value) : undefined; },
      [3](wireValue: Field) { return wireValue.type === WireType.LengthDelimited ? decodeBinary_3(wireValue.value) : undefined; },
      [4](wireValue: Field) { return wireValue.type === WireType.LengthDelimited ? decodeBinary_4(wireValue.value) : undefined; },
      [5](wireValue: Field) { return wireValue.type === WireType.LengthDelimited ? decodeBinary_5(wireValue.value) : undefined; },
      [6](wireValue: Field) { return wireValue.type === WireType.LengthDelimited ? decodeBinary_6(wireValue.value) : undefined; },
      [7](wireValue: Field) { return wireValue.type === WireType.LengthDelimited ? decodeBinary_7(wireValue.value) : undefined; },
      [8](wireValue: Field) { return wireValue.type === WireType.LengthDelimited ? decodeBinary_8(wireValue.value) : undefined; },
    };
    const value = (wireValueToTsValueMap[fieldNumber as keyof typeof wireValueToTsValueMap] as any)?.(wireValue!);
    if (value === undefined) break oneof;
    result.message = { field: oneofFieldNames.get(fieldNumber)!, value: value as any };
  }
  return result;
}
