export type Socket = Reader & Writer;

// same as `Deno.Reader`
export interface Reader {
  read(p: Uint8Array): Promise<number | null>;
}

// same as `Deno.Writer`
export interface Writer {
  write(p: Uint8Array): Promise<number>;
}

// same as `Deno.Closer`
export interface Closer {
  close(): void;
}
