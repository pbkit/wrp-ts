export interface BuildConfig extends NameAndVersion {
  dist: string;
  tmp?: string;
}

export interface NameAndVersion {
  name: string;
  version: string;
}

export function rewriteModulePath(
  code: string,
  fn: Parameters<typeof String.prototype.replaceAll>[1],
): string {
  // 1) import "foo";
  // 2) import bar from "foo";
  // 3) import { bar } from "foo";
  // 4) import * as bar from "foo";
  // 5) export { bar } from "foo";
  // 6) export * from "foo";
  // 7) } from "foo";
  return code.replaceAll(
    /(?<=^\s*(?:import\s*|(?:(?:import|export)\b.*?\b|}\s*)from\s*)(["'])).+(?=\1)/gm,
    fn,
  );
}

export function isPbkitPath(path: string): boolean {
  return (
    path.startsWith("https://deno.land/x/pbkit") ||
    path.startsWith("https:/deno.land/x/pbkit")
  );
}

export function isStdPath(path: string): boolean {
  return path.startsWith("https://deno.land/std");
}

export function replacePbkitRuntimePath(path: string): string {
  return removeExt(
    path.replace(
      /^https:\/\/?deno\.land\/x\/pbkit[^\/]*?\/core\/runtime/,
      "@pbkit/runtime",
    ),
  );
}

export function replaceStdPath(path: string): string {
  return removeExt(
    path.replace(
      /^https:\/\/deno\.land\/std[^\/]*?\/(.+)/,
      "compat/std/$1",
    ),
  );
}

export function removeExt(path: string): string {
  return path.replace(/\.[^.]+$/, "");
}
