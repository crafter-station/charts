import { $ } from "bun";

await $`bun x tsc --project tsconfig.build.json`;
console.log("Build complete → dist/");
