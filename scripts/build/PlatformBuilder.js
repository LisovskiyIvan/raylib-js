#!/usr/bin/env bun

import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Base class for platform-specific builders
 * Provides common functionality and interface for all platform builders
 */
export class PlatformBuilder {
    constructor(config = {}) {
        this.config = {
            packageRoot: config.packageRoot || process.cwd(),
            assetsDir: config.assetsDir || 'assets',
            wrappersDir: config.wrappersDir || 'src/wrappers',
            raylibInclude: config.raylibInclude || this.getDefaultRaylibInclude(),
            raylibLib: config.raylibLib || this.getDefaultRaylibLib(),
            ...config
        };

        this.platform = this.detectPlatform();
        this.compiler = null;
    }

    /**
     * Detect current platform information
     * @returns {Object} Platform information
     */
    detectPlatform() {
        const platform = process.platform;
        const arch = process.arch;

        let os, libraryExtension, executableExtension;

        switch (platform) {
            case 'win32':
                os = 'windows';
                libraryExtension = '.dll';
                executableExtension = '.exe';
                break;
            case 'linux':
                os = 'linux';
                libraryExtension = '.so';
                executableExtension = '';
                break;
            case 'darwin':
                os = 'macos';
                libraryExtension = '.dylib';
                executableExtension = '';
                break;
            default:
                throw new Error(`Unsupported platform: ${platform}`);
        }

        return {
            os,
            platform,
            arch,
            libraryExtension,
            executableExtension
        };
    }

    /**
     * Get default raylib include path for current platform
     * @returns {string} Default include path
     */
    getDefaultRaylibInclude() {
        return process.env.RAYLIB_INCLUDE || 'assets/raylib/include';
    }

    /**
     * Get default raylib library path for current platform
     * @returns {string} Default library path
     */
    getDefaultRaylibLib() {
        return process.env.RAYLIB_LIB || 'assets/raylib/lib';
    }

    /**
     * Validate build configuration
     * @returns {Object} Validation result
     */
    validateConfiguration() {
        const errors = [];
        const warnings = [];

        // Check if raylib headers exist
        const raylibHeader = join(this.config.raylibInclude, 'raylib.h');
        if (!existsSync(raylibHeader)) {
            errors.push(`raylib.h not found at: ${raylibHeader}`);
        }

        // Check if raylib library directory exists
        if (!existsSync(this.config.raylibLib)) {
            warnings.push(`raylib library directory not found: ${this.config.raylibLib}`);
        }

        // Check if wrappers directory exists
        const wrappersPath = join(this.config.packageRoot, this.config.wrappersDir);
        if (!existsSync(wrappersPath)) {
            errors.push(`Wrappers directory not found: ${wrappersPath}`);
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Ensure output directory exists
     * @param {string} outputPath - Path to output file
     */
    ensureOutputDirectory(outputPath) {
        const dir = dirname(outputPath);
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
            console.log(`📁 Created directory: ${dir}`);
        }
    }

    /**
     * Get all wrapper source files
     * @returns {Array} Array of wrapper configurations
     */
    getWrapperConfigurations() {
        const wrappersBase = join(this.config.packageRoot, this.config.wrappersDir);

        return [
            {
                name: 'raylib-wrapper',
                source: join(wrappersBase, 'raylib-wrapper.c'),
                output: join(this.config.assetsDir, `raylib-wrapper${this.platform.libraryExtension}`)
            },
            {
                name: 'texture-wrapper',
                source: join(wrappersBase, 'textures', 'texture-wrapper.c'),
                output: join(this.config.assetsDir, `texture-wrapper${this.platform.libraryExtension}`)
            },
            {
                name: 'render-texture-wrapper',
                source: join(wrappersBase, 'textures', 'render-texture-wrapper.c'),
                output: join(this.config.assetsDir, `render-texture-wrapper${this.platform.libraryExtension}`)
            },
            {
                name: 'model-wrapper',
                source: join(wrappersBase, 'models', 'model-wrapper.c'),
                output: join(this.config.assetsDir, `model-wrapper${this.platform.libraryExtension}`)
            },
            {
                name: 'mesh-collision-wrapper',
                source: join(wrappersBase, 'models', 'mesh-collision-wrapper.c'),
                output: join(this.config.assetsDir, `mesh-collision-wrapper${this.platform.libraryExtension}`)
            },
            {
                name: 'ray-collision-wrapper',
                source: join(wrappersBase, 'ray-collision', 'ray-collision-wrapper.c'),
                output: join(this.config.assetsDir, `ray-collision-wrapper${this.platform.libraryExtension}`)
            },
            {
                name: 'triangle-wrapper',
                source: join(wrappersBase, 'shapes', 'triangle-wrapper.c'),
                output: join(this.config.assetsDir, `triangle-wrapper${this.platform.libraryExtension}`)
            },
            {
                name: 'shader-wrapper',
                source: join(wrappersBase, 'shaders', 'shader-wrapper.c'),
                output: join(this.config.assetsDir, `shader-wrapper${this.platform.libraryExtension}`)
            }
        ];
    }

    /**
     * Build a single wrapper
     * @param {Object} wrapperConfig - Wrapper configuration
     * @returns {Promise<boolean>} Success status
     */
    async buildWrapper(wrapperConfig) {
        throw new Error('buildWrapper must be implemented by platform-specific builder');
    }

    /**
     * Build all wrappers
     * @returns {Promise<Object>} Build results
     */
    async buildAll() {
        console.log(`🔨 Building for ${this.platform.os} (${this.platform.arch})`);

        // Validate configuration
        const validation = this.validateConfiguration();
        if (!validation.valid) {
            console.error('❌ Configuration validation failed:');
            validation.errors.forEach(error => console.error(`  - ${error}`));
            return { success: false, errors: validation.errors };
        }

        if (validation.warnings.length > 0) {
            console.warn('⚠️  Configuration warnings:');
            validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
        }

        // Detect compiler
        if (!this.compiler) {
            console.log('🔍 Detecting compiler...');
            this.compiler = await this.detectCompiler();
            if (!this.compiler) {
                const error = 'No suitable compiler found';
                console.error(`❌ ${error}`);
                return { success: false, errors: [error] };
            }
            console.log(`✅ Using compiler: ${this.compiler.name} (${this.compiler.version})`);
        }

        // Build all wrappers
        const wrappers = this.getWrapperConfigurations();
        const results = [];

        for (const wrapper of wrappers) {
            console.log(`\n🔨 Building ${wrapper.name}...`);

            // Check if source file exists
            if (!existsSync(wrapper.source)) {
                const error = `Source file not found: ${wrapper.source}`;
                console.error(`❌ ${error}`);
                results.push({ wrapper: wrapper.name, success: false, error });
                continue;
            }

            try {
                this.ensureOutputDirectory(wrapper.output);
                const success = await this.buildWrapper(wrapper);

                if (success) {
                    console.log(`✅ ${wrapper.name} compiled successfully!`);
                    console.log(`📦 Output: ${wrapper.output}`);
                    results.push({ wrapper: wrapper.name, success: true });
                } else {
                    const error = `Compilation failed for ${wrapper.name}`;
                    console.error(`❌ ${error}`);
                    results.push({ wrapper: wrapper.name, success: false, error });
                }
            } catch (error) {
                console.error(`❌ Error building ${wrapper.name}:`, error.message);
                results.push({ wrapper: wrapper.name, success: false, error: error.message });
            }
        }

        const successful = results.filter(r => r.success).length;
        const total = results.length;

        console.log(`\n📊 Build Summary: ${successful}/${total} wrappers built successfully`);

        return {
            success: successful === total,
            results,
            summary: { successful, total, failed: total - successful }
        };
    }

    /**
     * Detect available compiler (to be implemented by subclasses)
     * @returns {Promise<Object|null>} Compiler information or null
     */
    async detectCompiler() {
        throw new Error('detectCompiler must be implemented by platform-specific builder');
    }

    /**
     * Get platform-specific compilation flags (to be implemented by subclasses)
     * @returns {Object} Compilation flags
     */
    getCompilationFlags() {
        throw new Error('getCompilationFlags must be implemented by platform-specific builder');
    }
}

export default PlatformBuilder;