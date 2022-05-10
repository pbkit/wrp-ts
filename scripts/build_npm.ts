import {
  build,
  emptyDir,
  EntryPoint,
} from "https://deno.land/x/dnt@0.23.0/mod.ts";
import { walk } from "https://deno.land/x/std@0.137.0/fs/mod.ts";

if (import.meta.main) {
  await buildNpm({
    dist: "tmp/npm",
    version: "0.0.1",
    entryPoints: await getEntrypoints(),
  });
}

async function getEntrypoints() {
  const entrypoints = [];
  for await (const file of walk("src", { exts: ["ts"] })) {
    entrypoints.push({ name: convertPathToName(file.path), path: file.path });
  }
  return entrypoints;
  function convertPathToName(path: string) {
    // Remove starting 'src' and '.ts' extension.
    const sliced = "." + path.slice(3, -3);
    // Convert '/some-path/index' to '/some-path'
    if (sliced.endsWith("index")) return sliced.slice(0, -6);
    return sliced;
  }
}

interface BuildConfig {
  dist: string;
  version: string;
  entryPoints: (string | EntryPoint)[];
}
async function buildNpm(config: BuildConfig) {
  await emptyDir(config.dist);
  await build({
    entryPoints: config.entryPoints,
    outDir: config.dist,
    typeCheck: false,
    test: false,
    shims: {
      deno: true,
    },
    package: {
      name: "@pbkit/wrp",
      version: config.version,
      description:
        "TypeScript Implementation of Webview/Worker Request Protocol",
      license: "(MIT OR Apache-2.0)",
      repository: {
        type: "git",
        url: "git+https://github.com/pbkit/wrp-ts.git",
      },
      bugs: {
        url: "https://github.com/pbkit/wrp-ts/issues",
      },
    },
  });
}
