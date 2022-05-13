export type Metadata = Record<string, string>;

export interface LazyMetadata {
  [key: string]:
    | undefined
    | string
    | Promise<string | undefined>
    | (() => string | undefined)
    | (() => Promise<string | undefined>);
}

export async function resolveLazyMetadata(
  lazyMetadata?: LazyMetadata,
): Promise<Metadata> {
  if (!lazyMetadata) return {};
  return Object.fromEntries(
    await Promise.all(
      dropNullishEntries(Object.entries(lazyMetadata)).map(
        async (entry) => {
          const [key, value] = entry;
          if (value instanceof Promise) [key, await value] as typeof entry;
          if (typeof value !== "function") return entry;
          else return [key, await value()] as typeof entry;
        },
      ),
    ).then(dropNullishEntries),
  );
  function dropNullishEntries(entries: [string, any][]) {
    return entries.filter((entry) => entry[1] != null);
  }
}
