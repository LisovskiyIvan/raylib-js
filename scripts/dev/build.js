#!/usr/bin/env bun

import { $ } from "bun";
import { rmSync, existsSync } from "fs";

console.log("🧹 Cleaning dist directory...");
if (existsSync("dist")) {
  rmSync("dist", { recursive: true });
}

console.log("📦 Building JavaScript bundle...");
await $`bun build src/index.ts --outdir dist --format esm --target bun --minify`;

console.log("📝 Generating bundled type definitions...");
await $`bun x rollup -c rollup.config.js`;

console.log("✅ Build complete!");
console.log("💡 Note: Run 'bun run compile' to build native C modules");