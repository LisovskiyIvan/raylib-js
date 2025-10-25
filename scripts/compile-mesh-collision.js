#!/usr/bin/env bun

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { WindowsBuilder } from './build/WindowsBuilder.js';
import { LinuxBuilder } from './build/LinuxBuilder.js';
import { MacOSBuilder } from './build/MacOSBuilder.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = dirname(__dirname);

/**
 * Compile mesh collision wrapper using cross-platform build system
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
 * Main compilation function for mesh collision wrapper
 */
async function compileMeshCollisionWrapper() {
    console.log('🔨 Compiling mesh collision wrapper...\n');

    try {
        // Create platform-specific builder
        const builder = createPlatformBuilder();

        // Get mesh collision wrapper configuration
        const wrappers = builder.getWrapperConfigurations();
        const meshCollisionWrapper = wrappers.find(w => w.name === 'mesh-collision-wrapper');

        if (!meshCollisionWrapper) {
            throw new Error('Mesh collision wrapper configuration not found');
        }

        console.log(`🔍 Platform: ${builder.platform.os} (${builder.platform.arch})`);
        console.log(`📁 Source: ${meshCollisionWrapper.source}`);
        console.log(`📦 Output: ${meshCollisionWrapper.output}\n`);

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

        // Build mesh collision wrapper
        const success = await builder.buildWrapper(meshCollisionWrapper);

        if (success) {
            console.log('\n🎉 Mesh collision wrapper compiled successfully!');
            console.log(`📦 Output: ${meshCollisionWrapper.output}`);
            process.exit(0);
        } else {
            console.error('\n❌ Mesh collision wrapper compilation failed');
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
    console.log('🔄 Running mesh collision wrapper compilation in legacy mode...\n');

    const { execSync } = await import('child_process');
    const { existsSync } = await import('fs');

    const RAYLIB_PATH = join(packageRoot, 'assets', 'raylib');
    const WRAPPER_SOURCE = join(packageRoot, 'src', 'wrappers', 'models', 'mesh-collision-wrapper.c');
    const OUTPUT_PATH = join(packageRoot, 'assets', 'lib', 'mesh-collision-wrapper.dylib');

    console.log('🔨 Compiling mesh collision wrapper...');
    console.log(`   Source: ${WRAPPER_SOURCE}`);
    console.log(`   Output: ${OUTPUT_PATH}`);

    // Check if source file exists
    if (!existsSync(WRAPPER_SOURCE)) {
        console.error(`❌ Source file not found: ${WRAPPER_SOURCE}`);
        process.exit(1);
    }

    // Check if raylib exists
    if (!existsSync(RAYLIB_PATH)) {
        console.error(`❌ Raylib not found at: ${RAYLIB_PATH}`);
        process.exit(1);
    }

    try {
        const command = `clang -shared -o ${OUTPUT_PATH} ${WRAPPER_SOURCE} \
          -I${RAYLIB_PATH}/include \
          -L${RAYLIB_PATH}/lib \
          -lraylib \
          -framework OpenGL \
          -framework Cocoa \
          -framework IOKit \
          -framework CoreVideo \
          -framework CoreAudio \
          -framework CoreFoundation \
          -Wno-deprecated-declarations`;

        console.log('\n📦 Running compilation...');
        execSync(command, { stdio: 'inherit' });

        console.log('\n✅ Mesh collision wrapper compiled successfully!');
        console.log(`   Output: ${OUTPUT_PATH}`);
    } catch (error) {
        console.error('\n❌ Compilation failed!');
        console.error(error.message);
        process.exit(1);
    }
}

/**
 * Print usage information
 */
function printUsage() {
    console.log('Usage: bun compile-mesh-collision.js [options]');
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
    compileMeshCollisionWrapper();
}
