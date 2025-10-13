#!/usr/bin/env bun

import { spawn } from "bun";
import { join } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const command = process.argv[2];

switch (command) {
  case "compile":
    console.log("🔨 Компилируем C модули для raylib-js...");
    try {
      const compileScript = join(__dirname, "compile-all.js");
      const result = spawn(["bun", compileScript], {
        stdio: ["inherit", "inherit", "inherit"],
      });
      
      const exitCode = await result.exited;
      if (exitCode === 0) {
        console.log("✅ Компиляция завершена успешно!");
      } else {
        console.error("❌ Ошибка при компиляции");
        process.exit(exitCode);
      }
    } catch (error) {
      console.error("❌ Ошибка при запуске компиляции:", error.message);
      process.exit(1);
    }
    break;

  case "help":
  case "--help":
  case "-h":
    console.log(`
raylib-js CLI

Использование:
  npx raylib-js compile     Компилировать C модули для raylib
  npx raylib-js help        Показать эту справку

Примеры:
  npx raylib-js compile     # Компилирует все необходимые C модули
`);
    break;

  default:
    if (!command) {
      console.log("❌ Не указана команда. Используйте 'npx raylib-js help' для справки.");
    } else {
      console.log(`❌ Неизвестная команда: ${command}`);
      console.log("Используйте 'npx raylib-js help' для справки.");
    }
    process.exit(1);
}