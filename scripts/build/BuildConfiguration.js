#!/usr/bin/env node

import { existsSync } from 'fs';
import { join, resolve } from 'path';

/**
 * Build configuration interface and validation logic
 */
export class BuildConfiguration {
    constructor(config = {}) {
        this.config = this.mergeWithDefaults(config);
        this.validationErrors = [];
        this.validationWarnings = [];
    }

    /**
     * Merge user config with defaults
     * @param {Object} userConfig - User provided configuration
     * @returns {Object} Merged configuration
     */
    mergeWithDefaults(userConfig) {
        const defaults = {
            // Project paths
            packageRoot: process.cwd(),
            assetsDir: 'assets',
            wrappersDir: 'src/wrappers',
            outputDir: 'assets',

            // Raylib paths
            raylibInclude: process.env.RAYLIB_INCLUDE || 'assets/raylib/include',
            raylibLib: process.env.RAYLIB_LIB || 'assets/raylib/lib',

            // Compilation options
            debug: false,
            verbose: false,
            parallel: true,

            // Platform-specific overrides
            platformOverrides: {},

            // Compiler preferences
            preferredCompiler: null,
            compilerFlags: {
                shared: true,
                pic: true,
                optimization: 'O2'
            }
        };

        return this.deepMerge(defaults, userConfig);
    }

    /**
     * Deep merge two objects
     * @param {Object} target - Target object
     * @param {Object} source - Source object
     * @returns {Object} Merged object
     */
    deepMerge(target, source) {
        const result = { ...target };

        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }

        return result;
    }

    /**
     * Validate the build configuration
     * @returns {Object} Validation result
     */
    validate() {
        this.validationErrors = [];
        this.validationWarnings = [];

        this.validatePaths();
        this.validateRaylib();
        this.validateWrappers();
        this.validateCompilerFlags();

        return {
            valid: this.validationErrors.length === 0,
            errors: this.validationErrors,
            warnings: this.validationWarnings
        };
    }

    /**
     * Validate project paths
     */
    validatePaths() {
        const { packageRoot, wrappersDir, outputDir } = this.config;

        // Check package root
        if (!existsSync(packageRoot)) {
            this.validationErrors.push(`Package root directory does not exist: ${packageRoot}`);
        }

        // Check wrappers directory
        const wrappersPath = resolve(packageRoot, wrappersDir);
        if (!existsSync(wrappersPath)) {
            this.validationErrors.push(`Wrappers directory does not exist: ${wrappersPath}`);
        }

        // Output directory will be created if it doesn't exist, so just warn
        const outputPath = resolve(packageRoot, outputDir);
        if (!existsSync(outputPath)) {
            this.validationWarnings.push(`Output directory will be created: ${outputPath}`);
        }
    }

    /**
     * Validate Raylib installation
     */
    validateRaylib() {
        const { raylibInclude, raylibLib } = this.config;

        // Check include directory
        const includePath = resolve(raylibInclude);
        if (!existsSync(includePath)) {
            this.validationErrors.push(`Raylib include directory does not exist: ${includePath}`);
        } else {
            // Check for raylib.h
            const raylibHeader = join(includePath, 'raylib.h');
            if (!existsSync(raylibHeader)) {
                this.validationErrors.push(`raylib.h not found in include directory: ${raylibHeader}`);
            }
        }

        // Check library directory
        const libPath = resolve(raylibLib);
        if (!existsSync(libPath)) {
            this.validationWarnings.push(`Raylib library directory does not exist: ${libPath}`);
        }
    }

    /**
     * Validate wrapper source files
     */
    validateWrappers() {
        const { packageRoot, wrappersDir } = this.config;
        const wrappersPath = resolve(packageRoot, wrappersDir);

        if (!existsSync(wrappersPath)) {
            return; // Already reported in validatePaths
        }

        const expectedWrappers = [
            'textures/texture-wrapper.c',
            'textures/render-texture-wrapper.c',
            'models/model-wrapper.c',
            'models/mesh-collision-wrapper.c',
            'ray-collision/ray-collision-wrapper.c'
        ];

        for (const wrapper of expectedWrappers) {
            const wrapperPath = join(wrappersPath, wrapper);
            if (!existsSync(wrapperPath)) {
                this.validationErrors.push(`Wrapper source file not found: ${wrapperPath}`);
            }
        }
    }

    /**
     * Validate compiler flags
     */
    validateCompilerFlags() {
        const { compilerFlags } = this.config;

        if (compilerFlags.optimization && !['O0', 'O1', 'O2', 'O3', 'Os'].includes(compilerFlags.optimization)) {
            this.validationWarnings.push(`Unknown optimization level: ${compilerFlags.optimization}`);
        }
    }

    /**
     * Get platform-specific configuration
     * @param {string} platform - Platform name (windows, linux, macos)
     * @returns {Object} Platform-specific configuration
     */
    getPlatformConfig(platform) {
        const baseConfig = { ...this.config };
        const platformOverrides = this.config.platformOverrides[platform] || {};

        return this.deepMerge(baseConfig, platformOverrides);
    }

    /**
     * Get wrapper configurations
     * @param {string} libraryExtension - Library extension for current platform
     * @returns {Array} Array of wrapper configurations
     */
    getWrapperConfigurations(libraryExtension) {
        const { packageRoot, wrappersDir, outputDir } = this.config;
        const wrappersPath = resolve(packageRoot, wrappersDir);
        const outputPath = resolve(packageRoot, outputDir);

        return [
            {
                name: 'texture-wrapper',
                source: join(wrappersPath, 'textures', 'texture-wrapper.c'),
                output: join(outputPath, `texture-wrapper${libraryExtension}`),
                category: 'textures'
            },
            {
                name: 'render-texture-wrapper',
                source: join(wrappersPath, 'textures', 'render-texture-wrapper.c'),
                output: join(outputPath, `render-texture-wrapper${libraryExtension}`),
                category: 'textures'
            },
            {
                name: 'model-wrapper',
                source: join(wrappersPath, 'models', 'model-wrapper.c'),
                output: join(outputPath, `model-wrapper${libraryExtension}`),
                category: 'models'
            },
            {
                name: 'mesh-collision-wrapper',
                source: join(wrappersPath, 'models', 'mesh-collision-wrapper.c'),
                output: join(outputPath, `mesh-collision-wrapper${libraryExtension}`),
                category: 'models'
            },
            {
                name: 'ray-collision-wrapper',
                source: join(wrappersPath, 'ray-collision', 'ray-collision-wrapper.c'),
                output: join(outputPath, `ray-collision-wrapper${libraryExtension}`),
                category: 'ray-collision'
            }
        ];
    }

    /**
     * Get compilation flags for a specific compiler
     * @param {Object} compiler - Compiler information
     * @param {string} platform - Target platform
     * @returns {Object} Compilation flags
     */
    getCompilationFlags(compiler, platform) {
        const { compilerFlags, raylibInclude, raylibLib, debug } = this.config;

        const flags = {
            include: [`-I${raylibInclude}`],
            library: [`-L${raylibLib}`, '-lraylib'],
            output: [],
            shared: [],
            optimization: [],
            platform: [],
            debug: []
        };

        // Shared library flags
        if (compilerFlags.shared) {
            flags.shared.push('-shared');
        }

        // Position Independent Code
        if (compilerFlags.pic) {
            flags.shared.push('-fPIC');
        }

        // Optimization
        if (compilerFlags.optimization && !debug) {
            flags.optimization.push(`-${compilerFlags.optimization}`);
        }

        // Debug flags
        if (debug) {
            flags.debug.push('-g', '-DDEBUG');
        }

        // Platform-specific flags
        this.addPlatformSpecificFlags(flags, compiler, platform);

        return flags;
    }

    /**
     * Add platform-specific compilation flags
     * @param {Object} flags - Flags object to modify
     * @param {Object} compiler - Compiler information
     * @param {string} platform - Target platform
     */
    addPlatformSpecificFlags(flags, compiler, platform) {
        switch (platform) {
            case 'windows':
                if (compiler.name === 'msvc') {
                    // MSVC flags
                    flags.shared = ['/LD']; // Create DLL
                    flags.include = flags.include.map(f => f.replace('-I', '/I'));
                    flags.library = flags.library.map(f => f.replace('-L', '/LIBPATH:'));
                } else {
                    // MinGW/GCC flags
                    flags.platform.push('-D_WIN32');
                }
                break;

            case 'linux':
                flags.platform.push('-D_LINUX');
                break;

            case 'macos':
                flags.platform.push(
                    '-framework', 'OpenGL',
                    '-framework', 'Cocoa',
                    '-framework', 'IOKit',
                    '-framework', 'CoreVideo'
                );
                break;
        }
    }

    /**
     * Generate installation instructions for missing dependencies
     * @returns {Object} Installation instructions
     */
    getInstallationInstructions() {
        const platform = process.platform;
        const instructions = {
            raylib: this.getRaylibInstallationInstructions(platform),
            compiler: this.getCompilerInstallationInstructions(platform)
        };

        return instructions;
    }

    /**
     * Get Raylib installation instructions
     * @param {string} platform - Current platform
     * @returns {Object} Raylib installation instructions
     */
    getRaylibInstallationInstructions(platform) {
        switch (platform) {
            case 'win32':
                return {
                    platform: 'Windows',
                    instructions: [
                        'Download raylib from: https://github.com/raysan5/raylib/releases',
                        'Extract to assets/raylib/ directory',
                        'Or install via vcpkg: vcpkg install raylib'
                    ]
                };

            case 'darwin':
                return {
                    platform: 'macOS',
                    instructions: [
                        'Install via Homebrew: brew install raylib',
                        'Or download from: https://github.com/raysan5/raylib/releases'
                    ]
                };

            case 'linux':
                return {
                    platform: 'Linux',
                    instructions: [
                        'Ubuntu/Debian: sudo apt-get install libraylib-dev',
                        'Fedora: sudo dnf install raylib-devel',
                        'Arch: sudo pacman -S raylib',
                        'Or build from source: https://github.com/raysan5/raylib'
                    ]
                };

            default:
                return {
                    platform: 'Unknown',
                    instructions: ['Please install raylib for your platform']
                };
        }
    }

    /**
     * Get compiler installation instructions
     * @param {string} platform - Current platform
     * @returns {Object} Compiler installation instructions
     */
    getCompilerInstallationInstructions(platform) {
        switch (platform) {
            case 'win32':
                return {
                    platform: 'Windows',
                    instructions: [
                        'Install Visual Studio Build Tools',
                        'Or install MinGW-w64',
                        'Or install LLVM/Clang'
                    ]
                };

            case 'darwin':
                return {
                    platform: 'macOS',
                    instructions: [
                        'Install Xcode Command Line Tools: xcode-select --install'
                    ]
                };

            case 'linux':
                return {
                    platform: 'Linux',
                    instructions: [
                        'Install build-essential or equivalent for your distribution'
                    ]
                };

            default:
                return {
                    platform: 'Unknown',
                    instructions: ['Please install a C compiler']
                };
        }
    }
}

export default BuildConfiguration;