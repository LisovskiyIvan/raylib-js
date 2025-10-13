#!/usr/bin/env bun

import { $ } from "bun";
import { existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = dirname(__dirname);

const ASSETS_DIR = "assets";
const WRAPPERS_DIR = join(packageRoot, "src/wrappers/textures");

// Создаем папку assets если её нет
if (!existsSync(ASSETS_DIR)) {
  mkdirSync(ASSETS_DIR, { recursive: true });
  console.log("📁 Created assets directory");
}

// Компилируем texture-wrapper.c
const sourceFile = join(WRAPPERS_DIR, "texture-wrapper.c");
const outputFile = join(ASSETS_DIR, "texture-wrapper.dylib");

console.log("🔨 Compiling texture wrappers...");

// Определяем пути к raylib
const raylibInclude = process.env.RAYLIB_INCLUDE || "assets/raylib/include";
const raylibLib = process.env.RAYLIB_LIB || "assets/raylib/lib";

// Проверяем наличие raylib
if (!existsSync(join(raylibInclude, "raylib.h"))) {
  console.error("❌ raylib.h not found!");
  console.log(`Searched in: ${raylibInclude}`);
  console.log(
    "\n💡 Install raylib or set RAYLIB_INCLUDE environment variable:"
  );
  console.log("   brew install raylib");
  console.log("   export RAYLIB_INCLUDE=/path/to/raylib/include");
  console.log("   export RAYLIB_LIB=/path/to/raylib/lib");
  process.exit(1);
}

try {
  // Компилируем с системным raylib
  await $`clang -shared -fPIC -I${raylibInclude} -L${raylibLib} -o ${outputFile} ${sourceFile} -lraylib -framework OpenGL -framework Cocoa -framework IOKit -framework CoreVideo`;

  console.log("✅ Texture wrappers compiled successfully!");
  console.log(`📦 Output: ${outputFile}`);
} catch (error) {
  console.error("❌ Compilation failed:", error.message);
  console.log("\n💡 Make sure raylib is properly installed:");
  console.log("   brew install raylib");
  process.exit(1);
}
