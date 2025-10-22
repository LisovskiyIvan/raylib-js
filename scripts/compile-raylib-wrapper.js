#!/usr/bin/env node

const { WindowsPlatformBuilder } = require('./build/WindowsPlatformBuilder');
const { LinuxPlatformBuilder } = require('./build/LinuxPlatformBuilder');
const { MacOSPlatformBuilder } = require('./build/MacOSPlatformBuilder');
const { PlatformBuilder } = require('./build/PlatformBuilder');

/**
 * Create platform-specific builder
 * @returns {PlatformBuilder} Platform-specific builder instance
 */
function createPlatformBuilder() {
    const platform = process.platform;

    switch (platform) {
        case 'win32':
            return new WindowsPlatformBuilder();
        case 'linux':
            return new LinuxPlatformBuilder();
        case 'darwin':
            return new MacOSPlatformBuilder();
        default:
            throw new Error(`Unsupported platform: ${platform}`);
    }
}

/**
 * Legacy compilation mode for backward compatibility
 */
async function compileLegacy() {
    const { execSync } = require('child_process');
    const path = require('path');

    console.log('Running in legacy mode...');

    const platform = process.platform;
    const sourceFile = path.join(__dirname, '..', 'src', 'wrappers', 'raylib-wrapper.c');
    const outputDir = path.join(__dirname, '..', 'lib');
    const raylibInclude = process.env.RAYLIB_INCLUDE_PATH || 'C:\\raylib\\raylib\\src';
    const raylibLib = process.env.RAYLIB_LIB_PATH || 'C:\\raylib\\raylib\\src';

    let outputFile;
    let compileCommand;

    if (platform === 'win32') {
        outputFile = path.join(outputDir, 'raylib-wrapper.dll');
        compileCommand = `gcc -shared -o "${outputFile}" "${sourceFile}" -I"${raylibInclude}" -L"${raylibLib}" -lraylib -lopengl32 -lgdi32 -lwinmm`;
    } else if (platform === 'linux') {
        outputFile = path.join(outputDir, 'raylib-wrapper.so');
        compileCommand = `gcc -shared -fPIC -o "${outputFile}" "${sourceFile}" -I"${raylibInclude}" -L"${raylibLib}" -lraylib -lm -lpthread -ldl -lrt -lX11`;
    } else if (platform === 'darwin') {
        outputFile = path.join(outputDir, 'raylib-wrapper.dylib');
        compileCommand = `gcc -shared -fPIC -o "${outputFile}" "${sourceFile}" -I"${raylibInclude}" -L"${raylibLib}" -lraylib -framework OpenGL -framework Cocoa -framework IOKit -framework CoreVideo`;
    } else {
        throw new Error(`Unsupported platform: ${platform}`);
    }

    console.log(`Compiling raylib wrapper for ${platform}...`);
    console.log(`Command: ${compileCommand}`);

    try {
        execSync(compileCommand, { stdio: 'inherit' });
        console.log(`✓ Successfully compiled: ${outputFile}`);
    } catch (error) {
        console.error(`✗ Compilation failed: ${error.message}`);
        process.exit(1);
    }
}

/**
 * Main compilation function for raylib wrapper
 */
async function compileRaylibWrapper() {
    console.log('='.repeat(60));
    console.log('Raylib Wrapper Compilation');
    console.log('='.repeat(60));

    try {
        const builder = createPlatformBuilder();

        // Validate configuration
        const validation = builder.validateConfiguration();
        if (!validation.valid) {
            console.error('\n❌ Configuration validation failed:');
            validation.errors.forEach(error => console.error(`  - ${error}`));

            if (validation.warnings.length > 0) {
                console.warn('\n⚠️  Warnings:');
                validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
            }

            process.exit(1);
        }

        // Build raylib wrapper
        const wrapperConfig = {
            name: 'raylib-wrapper',
            source: 'src/wrappers/raylib-wrapper.c',
            output: builder.getOutputPath('raylib-wrapper')
        };

        console.log(`\nBuilding ${wrapperConfig.name}...`);
        const success = await builder.buildWrapper(wrapperConfig);

        if (success) {
            console.log(`\n✅ Raylib wrapper compiled successfully!`);
            console.log(`Output: ${wrapperConfig.output}`);
        } else {
            console.error(`\n❌ Failed to compile raylib wrapper`);
            process.exit(1);
        }

    } catch (error) {
        console.error('\n❌ Compilation error:', error.message);
        if (error.stack) {
            console.error('\nStack trace:', error.stack);
        }
        process.exit(1);
    }
}

/**
 * Print usage information
 */
function printUsage() {
    console.log(`
Usage: node compile-raylib-wrapper.js [options]

Options:
  --legacy    Use legacy compilation mode (direct gcc commands)
  --help      Show this help message

Environment Variables:
  RAYLIB_INCLUDE_PATH    Path to raylib include directory
  RAYLIB_LIB_PATH        Path to raylib library directory

Examples:
  node compile-raylib-wrapper.js
  node compile-raylib-wrapper.js --legacy
  RAYLIB_INCLUDE_PATH=/usr/local/include node compile-raylib-wrapper.js
`);
}

// Main execution
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.includes('--help')) {
        printUsage();
        process.exit(0);
    }

    if (args.includes('--legacy')) {
        compileLegacy().catch(error => {
            console.error('Compilation failed:', error);
            process.exit(1);
        });
    } else {
        compileRaylibWrapper().catch(error => {
            console.error('Compilation failed:', error);
            process.exit(1);
        });
    }
}

module.exports = { compileRaylibWrapper, compileLegacy };
