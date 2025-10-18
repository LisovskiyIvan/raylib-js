#!/usr/bin/env bun

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { WindowsBuilder } from './build/WindowsBuilder.js';
import { LinuxBuilder } from './build/LinuxBuilder.js';
import { MacOSBuilder } from './build/MacOSBuilder.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = dirname(__dirname);

/**
 * Cross-platform compilation script using the new PlatformBuilder system
 * Automatically detects platform and uses appropriate builder
 */

/**
 * Create platform-specific builder based on current platform
 * @returns {PlatformBuilder} Platform-specific builder instance
 */
function createPlatformBuilder() {
  const platform = process.platform;

  console.log(`🔍 Detected platform: ${platform} (${process.arch})`);

  const config = {
    packageRoot,
    verbose: process.argv.includes('--verbose') || process.argv.includes('-v'),
    debug: process.argv.includes('--debug') || process.argv.includes('-d')
  };

  switch (platform) {
    case 'win32':
      console.log('🏗️  Using Windows builder');
      return new WindowsBuilder(config);

    case 'linux':
      console.log('🏗️  Using Linux builder');
      return new LinuxBuilder(config);

    case 'darwin':
      console.log('🏗️  Using macOS builder');
      return new MacOSBuilder(config);

    default:
      throw new Error(`Unsupported platform: ${platform}. Supported platforms: Windows, Linux, macOS`);
  }
}

/**
 * Main compilation function
 */
async function compileAll() {
  console.log('🚀 Starting cross-platform compilation...\n');

  try {
    // Create platform-specific builder
    const builder = createPlatformBuilder();

    // Build all wrappers
    const result = await builder.buildAll();

    if (result.success) {
      console.log('\n🎉 All wrappers compiled successfully!');
      console.log(`📊 Summary: ${result.summary.successful}/${result.summary.total} wrappers built`);

      // List successful builds
      const successful = result.results.filter(r => r.success);
      if (successful.length > 0) {
        console.log('\n✅ Successfully built:');
        successful.forEach(r => console.log(`   - ${r.wrapper}`));
      }

      process.exit(0);
    } else {
      console.error('\n❌ Some wrappers failed to compile');
      console.log(`📊 Summary: ${result.summary.successful}/${result.summary.total} wrappers built`);

      // List failed builds
      const failed = result.results.filter(r => !r.success);
      if (failed.length > 0) {
        console.error('\n❌ Failed to build:');
        failed.forEach(r => console.error(`   - ${r.wrapper}: ${r.error || 'Unknown error'}`));
      }

      process.exit(1);
    }

  } catch (error) {
    console.error('\n💥 Fatal error during compilation:');
    console.error(error.message);

    if (error.message.includes('Unsupported platform')) {
      console.log('\n💡 This platform is not yet supported.');
      console.log('   Supported platforms: Windows, Linux, macOS');
    } else if (error.message.includes('No suitable compiler')) {
      console.log('\n💡 No suitable compiler found.');
      console.log('   Please install a C compiler for your platform:');
      console.log('   - Windows: Visual Studio Build Tools or MinGW');
      console.log('   - Linux: GCC or Clang (build-essential package)');
      console.log('   - macOS: Xcode Command Line Tools');
    } else if (error.message.includes('raylib')) {
      console.log('\n💡 Raylib not found.');
      console.log('   Please install raylib for your platform:');
      console.log('   - Windows: Download from raylib.com or use vcpkg');
      console.log('   - Linux: sudo apt install libraylib-dev (Ubuntu/Debian)');
      console.log('   - macOS: brew install raylib');
    }

    process.exit(1);
  }
}

/**
 * Legacy mode: run individual compilation scripts for backward compatibility
 * This mode is used when --legacy flag is provided
 */
async function runLegacyMode() {
  console.log('🔄 Running in legacy mode...\n');

  const fs = await import('fs');
  const { spawn } = await import('child_process');

  const scriptFiles = fs.readdirSync(__dirname)
    .filter(file => file.endsWith('.js') && file !== 'compile-all.js' && file.includes('compile'))
    .map(file => join(__dirname, file));

  for (const scriptPath of scriptFiles) {
    console.log(`Running script: ${scriptPath.split('/').pop()}`);

    await new Promise((resolve, reject) => {
      const proc = spawn('bun', [scriptPath], { stdio: 'inherit' });

      proc.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ ${scriptPath.split('/').pop()} completed successfully`);
          resolve();
        } else {
          reject(new Error(`Script ${scriptPath.split('/').pop()} exited with code ${code}`));
        }
      });
    });
  }

  console.log('✅ All legacy scripts completed successfully');
}

/**
 * Print usage information
 */
function printUsage() {
  console.log('Usage: bun compile-all.js [options]');
  console.log('');
  console.log('Options:');
  console.log('  --verbose, -v    Enable verbose output');
  console.log('  --debug, -d      Enable debug mode');
  console.log('  --legacy         Use legacy compilation scripts');
  console.log('  --help, -h       Show this help message');
  console.log('');
  console.log('Examples:');
  console.log('  bun compile-all.js                 # Compile with platform detection');
  console.log('  bun compile-all.js --verbose       # Compile with verbose output');
  console.log('  bun compile-all.js --legacy        # Use legacy compilation method');
}

// Main execution
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  printUsage();
  process.exit(0);
} else if (process.argv.includes('--legacy')) {
  runLegacyMode()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Legacy compilation failed:', err.message);
      process.exit(1);
    });
} else {
  compileAll();
}
