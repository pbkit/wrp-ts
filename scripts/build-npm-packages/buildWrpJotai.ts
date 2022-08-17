import { ensureDir } from "https://deno.land/std@0.137.0/fs/mod.ts";
import { walk } from "https://deno.land/std@0.137.0/fs/walk.ts";
import {
  dirname,
  join,
  relative,
} from "https://deno.land/std@0.137.0/path/mod.ts";
import {
  BuildConfig,
  isPbkitPath,
  isStdPath,
  NameAndVersion,
  removeExt,
  replacePbkitRuntimePath,
  replaceStdPath,
  rewriteModulePath,
} from "./index.ts";

export default async function buildWrpJotai(config: BuildConfig) {
  const packageJson = getPackageJson(config);
  const tsDir = `${config.tmp}/ts`;
  await ensureDir(config.dist);
  await Deno.writeTextFile(
    `${config.dist}/package.json`,
    JSON.stringify(packageJson, null, 2) + "\n",
  );
  await Promise.all([
    Deno.copyFile("LICENSE-MIT", `${config.dist}/LICENSE-MIT`),
    Deno.copyFile("LICENSE-APACHE", `${config.dist}/LICENSE-APACHE`),
    Deno.copyFile("README.md", `${config.dist}/README.md`),
  ]);
  { // copy ts files
    const srcDir = "src/jotai";
    const entries = walk(srcDir, { includeDirs: false, exts: [".ts"] });
    for await (const { path: fromPath } of entries) {
      const path = fromPath.substring(srcDir.length + 1);
      const toPath = join(tsDir, path);
      await ensureDir(dirname(toPath));
      const code = await Deno.readTextFile(fromPath);
      await Deno.writeTextFile(
        toPath,
        rewriteModulePath(code, (modulePath) => {
          if (modulePath.startsWith("../react/")) {
            return removeExt(
              modulePath.replace(/^\.\.\/react\//, "@pbkit/wrp-react/"),
            );
          } else if (modulePath.startsWith("../")) {
            return removeExt(modulePath.replace(/^\.\.\//, "@pbkit/wrp/"));
          } else if (modulePath.startsWith(".")) {
            return removeExt(modulePath);
          } else if (isStdPath(modulePath)) {
            const relativePath = relative(
              dirname(path),
              replaceStdPath(modulePath),
            );
            if (!relativePath.startsWith(".")) return `./${relativePath}`;
            return relativePath;
          } else if (isPbkitPath(modulePath)) {
            return replacePbkitRuntimePath(modulePath);
          } else {
            return modulePath;
          }
        }),
      );
    }
  }
  { // tsc
    const entries = walk(tsDir, { includeDirs: false, exts: [".ts"] });
    const tsFiles: string[] = [];
    for await (const { path } of entries) tsFiles.push(path);
    await Deno.run({
      stdout: "null",
      stderr: "null",
      cmd: [
        "tsc",
        "-m",
        "commonjs",
        "--target",
        "es2019",
        "--lib",
        "es2019,dom",
        "--declaration",
        "--rootDir",
        tsDir,
        "--outDir",
        config.dist,
        ...tsFiles,
      ],
    }).status();
  }
}

export function getPackageJson(config: NameAndVersion) {
  const { name, version } = config;
  return {
    name,
    version,
    author: "JongChan Choi <jong@chan.moe>",
    license: "(MIT OR Apache-2.0)",
    repository: {
      type: "git",
      url: "git+https://github.com/pbkit/wrp-ts.git",
    },
    peerDependencies: {
      "@pbkit/wrp": "*",
      "jotai": "*",
    },
  };
}
