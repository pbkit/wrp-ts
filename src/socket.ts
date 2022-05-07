export type Socket = Deno.Reader & Deno.Writer;
export interface Disposable {
  dispose(): void;
}
