#!/usr/bin/env bun

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { WindowsBuilder } from './build/WindowsBuilder.js';
import { LinuxBuilder } from './build/LinuxBuilder.js';
import { MacOSBuilder } from './build/MacOSBuilder.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = dirname(__dirname);

/**
 * Compile model wrapper using cross-platform build system
 */

/**
 * Create platform-specific builder
 * @returns {PlatformBuilder} Platform-specific builder instance
 */
function createPlatformBuilder() {
  const platform = process.platform;

  const config = {
    packageRoot,
    verbose: process.argv.includes('--verbose') || process.argv.includes('-v'),
    debug: process.argv.includes('--debug') || process.argv.includes('-d')
  };

  switch (platform) {
    case 'win32':
      return new WindowsBuilder(config);
    case 'linux':
      return new LinuxBuilder(config);
    case 'darwin':
      return new MacOSBuilder(config);
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

/**
 * Main compilation function for model wrapper
 */
async function compileModelWrapper() {
  console.log('🔨 Compiling model wrapper...\n');

  try {
    // Create platform-specific builder
    const builder = createPlatformBuilder();

    // Get model wrapper configuration
    const wrappers = builder.getWrapperConfigurations();
    const modelWrapper = wrappers.find(w => w.name === 'model-wrapper');

    if (!modelWrapper) {
      throw new Error('Model wrapper configuration not found');
    }

    console.log(`🔍 Platform: ${builder.platform.os} (${builder.platform.arch})`);
    console.log(`📁 Source: ${modelWrapper.source}`);
    console.log(`📦 Output: ${modelWrapper.output}\n`);

    // Validate configuration
    const validation = builder.validateConfiguration();
    if (!validation.valid) {
      console.error('❌ Configuration validation failed:');
      validation.errors.forEach(error => console.error(`  - ${error}`));

      // Show platform-specific installation instructions
      if (validation.errors.some(e => e.includes('raylib'))) {
        console.log('\n💡 Install raylib for your platform:');
        switch (builder.platform.os) {
          case 'windows':
            console.log('   - Download from raylib.com');
            console.log('   - Or use vcpkg: vcpkg install raylib');
            console.log('   - Set RAYLIB_INCLUDE and RAYLIB_LIB environment variables');
            break;
          case 'linux':
            console.log('   - Ubuntu/Debian: sudo apt install libraylib-dev');
            console.log('   - Fedora: sudo dnf install raylib-devel');
            console.log('   - Arch: sudo pacman -S raylib');
            break;
          case 'macos':
            console.log('   - Homebrew: brew install raylib');
            console.log('   - MacPorts: sudo port install raylib');
            break;
        }
      }

      process.exit(1);
    }

    if (validation.warnings.length > 0) {
      console.warn('⚠️  Configuration warnings:');
      validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
      console.log('');
    }

    // Detect compiler
    console.log('🔍 Detecting compiler...');
    builder.compiler = await builder.detectCompiler();
    if (!builder.compiler) {
      console.error('❌ No suitable compiler found');
      process.exit(1);
    }
    console.log(`✅ Using compiler: ${builder.compiler.name} (${builder.compiler.version})\n`);

    // Build model wrapper
    const success = await builder.buildWrapper(modelWrapper);

    if (success) {
      console.log('\n🎉 Model wrapper compiled successfully!');
      console.log(`📦 Output: ${modelWrapper.output}`);
      process.exit(0);
    } else {
      console.error('\n❌ Model wrapper compilation failed');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n💥 Fatal error during compilation:');
    console.error(error.message);

    if (error.message.includes('Unsupported platform')) {
      console.log('\n💡 This platform is not yet supported.');
      console.log('   Supported platforms: Windows, Linux, macOS');
    }

    process.exit(1);
  }
}

/**
 * Legacy compilation mode for backward compatibility
 */
async function compileLegacy() {
  console.log('🔄 Running model wrapper compilation in legacy mode...\n');

  const { $ } = await import("bun");
  const { existsSync, mkdirSync } = await import("fs");

  const ASSETS_DIR = "assets";
  const WRAPPERS_DIR = join(packageRoot, "src/wrappers/models");

  // Create assets directory if it doesn't exist
  if (!existsSync(ASSETS_DIR)) {
    mkdirSync(ASSETS_DIR, { recursive: true });
  }

  // Compile model-wrapper.c
  const sourceFile = join(WRAPPERS_DIR, "model-wrapper.c");
  const outputFile = join(ASSETS_DIR, "lib", "model-wrapper.dylib");

  console.log("🔨 Compiling model wrappers...");

  // Define raylib paths
  const raylibInclude = "./assets/raylib/include";
  const raylibLib = "./assets/raylib/lib";

  // Check for raylib
  if (!existsSync(raylibInclude) || !existsSync(raylibLib)) {
    console.error("❌ Raylib not found in assets/raylib/");
    console.error("Please ensure raylib is installed in the correct location.");
    process.exit(1);
  }

  try {
    // Compile with required flags for macOS
    await $`clang -shared -fPIC -I${raylibInclude} -L${raylibLib} -o ${outputFile} ${sourceFile} -lraylib -framework OpenGL -framework Cocoa -framework IOKit -framework CoreVideo`;

    console.log("✅ Model wrappers compiled successfully!");
    console.log(`📦 Output: ${outputFile}`);
  } catch (error) {
    console.error("❌ Compilation failed:", error.message);
    process.exit(1);
  }
}

/**
 * Print usage information
 */
function printUsage() {
  console.log('Usage: bun compile-models.js [options]');
  console.log('');
  console.log('Options:');
  console.log('  --verbose, -v    Enable verbose output');
  console.log('  --debug, -d      Enable debug mode');
  console.log('  --legacy         Use legacy compilation (macOS only)');
  console.log('  --help, -h       Show this help message');
}

// Main execution
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  printUsage();
  process.exit(0);
} else if (process.argv.includes('--legacy')) {
  compileLegacy();
} else {
  compileModelWrapper();
}