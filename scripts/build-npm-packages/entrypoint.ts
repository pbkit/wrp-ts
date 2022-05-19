import { emptyDir } from "https://deno.land/std@0.122.0/fs/mod.ts";
import buildWrp from "./buildWrp.ts";
import buildWrpReact from "./buildWrpReact.ts";

await emptyDir("tmp/npm");

const latestTag = new TextDecoder().decode(
  await Deno.run({
    cmd: ["git", "describe", "--tags", "--abbrev=0"],
    stdout: "piped",
  }).output(),
);
const version = latestTag.slice(1).trim();

await Promise.all([
  buildWrp({
    name: "@pbkit/wrp",
    version,
    dist: "tmp/npm/wrp",
    tmp: "tmp/npm/tmp/wrp",
  }),
  buildWrpReact({
    name: "@pbkit/wrp-react",
    version,
    dist: "tmp/npm/wrp-react",
    tmp: "tmp/npm/tmp/wrp-react",
  }),
]);
