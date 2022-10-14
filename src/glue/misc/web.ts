export const eventKey = "<glue>";
export const handshakeEventKey = "<glue-handshake>";

export interface GlueEvent {
  data: [
    glueKey: typeof eventKey,
    payload: Uint8Array,
  ];
  source: typeof globalThis | Window;
}
export function isGlueEvent(event: any): event is GlueEvent {
  if (!Array.isArray(event.data)) return false;
  if (event.data.length < 2) return false;
  if (event.data[0] !== eventKey) return false;
  return true;
}

export interface GlueHandshakeEvent {
  data: [
    glueKey: typeof handshakeEventKey,
    payload: "syn" | "syn-ack" | "ack",
  ];
  source: typeof globalThis | Window;
}
export function isGlueHandshakeEvent(event: any): event is GlueHandshakeEvent {
  if (!Array.isArray(event.data)) return false;
  if (event.data.length < 2) return false;
  if (event.data[0] !== handshakeEventKey) return false;
  return true;
}

export interface PostGlueHandshakeMessageConfig {
  target: Window;
  targetOrigin: string;
  payload: GlueHandshakeEvent["data"]["1"];
}
export function postGlueHandshakeMessage(
  config: PostGlueHandshakeMessageConfig,
): boolean {
  const { target, targetOrigin, payload } = config;
  if (target.closed) return false;
  target.postMessage([handshakeEventKey, payload], targetOrigin);
  return true;
}

export interface PostGlueMessageConfig {
  target: Window;
  targetOrigin: string;
  payload: Uint8Array;
}
export function postGlueMessage(config: PostGlueMessageConfig): boolean {
  const { target, targetOrigin, payload } = config;
  if (target.closed) return false;
  target.postMessage([eventKey, payload], targetOrigin, [payload.buffer]);
  return true;
}
