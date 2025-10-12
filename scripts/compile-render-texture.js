#!/usr/bin/env bun

import { $ } from "bun";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

const ASSETS_DIR = "assets";
const WRAPPERS_DIR = "src/wrappers/textures";

// Создаем папку assets если её нет
if (!existsSync(ASSETS_DIR)) {
  mkdirSync(ASSETS_DIR, { recursive: true });
  console.log("📁 Created assets directory");
}

// Компилируем render-texture-wrapper.c
const sourceFile = join(WRAPPERS_DIR, "render-texture-wrapper.c");
const outputFile = join(ASSETS_DIR, "render-texture-wrapper.dylib");

console.log("🔨 Compiling render texture wrapper...");

try {
  const raylibInclude = "assets/raylib-5.5_macos/include";
  const raylibLib = "assets/raylib-5.5_macos/lib";
  
  // Компилируем с локальным raylib
  await $`clang -shared -fPIC -I${raylibInclude} -L${raylibLib} -o ${outputFile} ${sourceFile} -lraylib -framework OpenGL -framework Cocoa -framework IOKit -framework CoreVideo`;
  
  console.log("✅ Render texture wrapper compiled successfully!");
  console.log(`📦 Output: ${outputFile}`);
} catch (error) {
  console.error("❌ Compilation failed:", error.message);
  console.log("\n💡 Make sure raylib is available in assets/raylib-5.5_macos/");
  process.exit(1);
}