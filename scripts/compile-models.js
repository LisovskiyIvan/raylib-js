#!/usr/bin/env bun

import { $ } from "bun";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";

const packageRoot = process.cwd();

const ASSETS_DIR = "assets";
const WRAPPERS_DIR = join(packageRoot, "src/wrappers/models");

// Создаем папку assets если её нет
if (!existsSync(ASSETS_DIR)) {
  mkdirSync(ASSETS_DIR, { recursive: true });
}

// Компилируем model-wrapper.c
const sourceFile = join(WRAPPERS_DIR, "model-wrapper.c");
const outputFile = join(ASSETS_DIR, "model-wrapper.dylib");

console.log("🔨 Compiling model wrappers...");

// Определяем пути к raylib
const raylibInclude = "./assets/raylib/include";
const raylibLib = "./assets/raylib/lib";

// Проверяем наличие raylib
if (!existsSync(raylibInclude) || !existsSync(raylibLib)) {
  console.error("❌ Raylib not found in assets/raylib/");
  console.error("Please ensure raylib is installed in the correct location.");
  process.exit(1);
}

try {
  // Компилируем с нужными флагами для macOS
  await $`clang -shared -fPIC -I${raylibInclude} -L${raylibLib} -o ${outputFile} ${sourceFile} -lraylib -framework OpenGL -framework Cocoa -framework IOKit -framework CoreVideo`;

  console.log("✅ Model wrappers compiled successfully!");
  console.log(`📦 Output: ${outputFile}`);
} catch (error) {
  console.error("❌ Compilation failed:", error.message);
  process.exit(1);
}