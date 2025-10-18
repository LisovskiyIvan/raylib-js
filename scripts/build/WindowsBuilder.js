#!/usr/bin/env bun

import { PlatformBuilder } from './PlatformBuilder.js';
import { CompilerDetector } from './CompilerDetector.js';
import { spawn } from 'child_process';
import { join } from 'path';

/**
 * Windows-specific builder with MSVC and MinGW support
 * Handles .dll file generation and Windows-specific compilation flags
 */
export class WindowsBuilder extends PlatformBuilder {
    constructor(config = {}) {
        super(config);

        // Windows-specific configuration
        this.config = {
            ...this.config,
            // Default Windows raylib paths
            raylibInclude: config.raylibInclude || process.env.RAYLIB_INCLUDE || 'assets/raylib/include',
            raylibLib: config.raylibLib || process.env.RAYLIB_LIB || 'assets/raylib/lib',
            // Windows-specific options
            useStaticRuntime: config.useStaticRuntime || false,
            enableDebugInfo: config.enableDebugInfo || false,
            ...config
        };
    }

    /**
     * Detect available compiler for Windows (MSVC, Clang, or MinGW)
     * @returns {Promise<Object|null>} Compiler information or null
     */
    async detectCompiler() {
        console.log('🔍 Detecting Windows compilers...');

        // Try MSVC first (preferred for Windows)
        const msvcCompiler = await CompilerDetector.detectMSVC();
        if (msvcCompiler) {
            console.log(`✅ Found MSVC: ${msvcCompiler.version}`);
            return {
                ...msvcCompiler,
                type: 'msvc',
                flags: this.getMSVCFlags()
            };
        }

        // Try Clang (LLVM)
        const clangCompiler = await CompilerDetector.detectClang();
        if (clangCompiler) {
            console.log(`✅ Found Clang: ${clangCompiler.version}`);
            return {
                ...clangCompiler,
                type: 'clang',
                flags: this.getClangFlags()
            };
        }

        // Try MinGW as fallback
        const mingwCompiler = await CompilerDetector.detectMinGW();
        if (mingwCompiler) {
            console.log(`✅ Found MinGW: ${mingwCompiler.version}`);
            return {
                ...mingwCompiler,
                type: 'mingw',
                flags: this.getMinGWFlags()
            };
        }

        // Try regular GCC (might be MinGW)
        const gccCompiler = await CompilerDetector.detectGCC();
        if (gccCompiler && process.platform === 'win32') {
            console.log(`✅ Found GCC: ${gccCompiler.version}`);
            return {
                ...gccCompiler,
                type: 'gcc',
                flags: this.getMinGWFlags() // Use MinGW-style flags for GCC on Windows
            };
        }

        console.error('❌ No suitable compiler found for Windows');
        console.log('\n💡 Install one of the following:');
        console.log('   - Visual Studio Build Tools (MSVC)');
        console.log('   - LLVM/Clang for Windows');
        console.log('   - MinGW-w64');

        return null;
    }

    /**
     * Get MSVC-specific compilation flags
     * @returns {Object} MSVC compilation flags
     */
    getMSVCFlags() {
        const flags = {
            // Basic compilation flags
            compile: [
                '/c',                    // Compile only, don't link
                '/TC',                   // Treat all files as C source
                '/nologo',               // Suppress startup banner
                '/W3',                   // Warning level 3
            ],

            // Include directories
            include: [
                `/I"${this.config.raylibInclude}"`,
            ],

            // Preprocessor definitions
            defines: [
                '/DPLATFORM_DESKTOP',
                '/D_CRT_SECURE_NO_WARNINGS',
                '/DWIN32',
                '/D_WINDOWS',
            ],

            // Optimization and runtime
            optimization: this.config.enableDebugInfo ? ['/Od', '/Zi'] : ['/O2'],
            runtime: this.config.useStaticRuntime ? ['/MT'] : ['/MD'],

            // Linking flags
            link: [
                '/DLL',                  // Create DLL
                '/nologo',               // Suppress startup banner
                `/LIBPATH:"${this.config.raylibLib}"`,
            ],

            // Libraries to link
            libraries: [
                'raylib.lib',
                'opengl32.lib',
                'gdi32.lib',
                'winmm.lib',
                'user32.lib',
                'shell32.lib',
            ],

            // Output flags
            output: {
                object: '/Fo:',          // Object file output
                dll: '/OUT:',            // DLL output
            }
        };

        // Add debug info for linking if enabled
        if (this.config.enableDebugInfo) {
            flags.link.push('/DEBUG');
        }

        return flags;
    }

    /**
     * Get Clang-specific compilation flags for Windows
     * @returns {Object} Clang compilation flags
     */
    getClangFlags() {
        return {
            // Basic compilation flags
            compile: [
                '-c',                    // Compile only, don't link
                '-std=c99',              // C99 standard
                '-Wall',                 // Enable warnings
                '-Wextra',               // Extra warnings
                // Note: -fPIC is not needed/supported on Windows with MSVC target
            ],

            // Include directories
            include: [
                `-I"${this.config.raylibInclude}"`,
            ],

            // Preprocessor definitions
            defines: [
                '-DPLATFORM_DESKTOP',
                '-DWIN32',
                '-D_WINDOWS',
            ],

            // Optimization
            optimization: this.config.enableDebugInfo ? ['-g', '-O0'] : ['-O2'],

            // Linking flags
            link: [
                '-shared',               // Create shared library
                `-L"${this.config.raylibLib}"`,
            ],

            // Libraries to link (Windows-specific for Clang)
            libraries: [
                `"${this.config.raylibLib}/raylibdll.lib"`,  // Use DLL import library
                '-lopengl32',           // System libraries use -l prefix
                '-lgdi32',
                '-lwinmm',
                '-luser32',
                '-lshell32',
            ],

            // Output flags
            output: {
                object: '-o',            // Object file output
                dll: '-o',               // DLL output
            }
        };
    }

    /**
     * Get MinGW-specific compilation flags
     * @returns {Object} MinGW compilation flags
     */
    getMinGWFlags() {
        return {
            // Basic compilation flags
            compile: [
                '-c',                    // Compile only, don't link
                '-std=c99',              // C99 standard
                '-Wall',                 // Enable warnings
                '-Wextra',               // Extra warnings
                '-fPIC',                 // Position independent code
            ],

            // Include directories
            include: [
                `-I"${this.config.raylibInclude}"`,
            ],

            // Preprocessor definitions
            defines: [
                '-DPLATFORM_DESKTOP',
                '-DWIN32',
                '-D_WINDOWS',
            ],

            // Optimization
            optimization: this.config.enableDebugInfo ? ['-g', '-O0'] : ['-O2'],

            // Linking flags
            link: [
                '-shared',               // Create shared library
                `-L"${this.config.raylibLib}"`,
            ],

            // Libraries to link
            libraries: [
                '-lraylib',
                '-lopengl32',
                '-lgdi32',
                '-lwinmm',
            ],

            // Output flags
            output: {
                object: '-o',            // Object file output
                dll: '-o',               // DLL output
            }
        };
    }

    /**
     * Get platform-specific compilation flags
     * @returns {Object} Compilation flags for current compiler
     */
    getCompilationFlags() {
        if (!this.compiler) {
            throw new Error('Compiler not detected. Call detectCompiler() first.');
        }

        return this.compiler.flags;
    }

    /**
     * Build a single wrapper using MSVC
     * @param {Object} wrapperConfig - Wrapper configuration
     * @returns {Promise<boolean>} Success status
     */
    async buildWrapperMSVC(wrapperConfig) {
        const flags = this.getMSVCFlags();
        const objFile = wrapperConfig.output.replace('.dll', '.obj');

        // Step 1: Compile to object file
        const compileArgs = [
            ...flags.compile,
            ...flags.include,
            ...flags.defines,
            ...flags.optimization,
            ...flags.runtime,
            `${flags.output.object}"${objFile}"`,
            `"${wrapperConfig.source}"`
        ];

        console.log(`📝 Compiling: ${this.compiler.command} ${compileArgs.join(' ')}`);

        const compileResult = await this.executeCommand(this.compiler.command, compileArgs);
        if (!compileResult.success) {
            console.error('❌ Compilation failed:', compileResult.stderr);
            return false;
        }

        // Step 2: Link to DLL
        const linkArgs = [
            ...flags.link,
            ...flags.libraries,
            `${flags.output.dll}"${wrapperConfig.output}"`,
            `"${objFile}"`
        ];

        console.log(`🔗 Linking: link ${linkArgs.join(' ')}`);

        const linkResult = await this.executeCommand('link', linkArgs);
        if (!linkResult.success) {
            console.error('❌ Linking failed:', linkResult.stderr);
            return false;
        }

        return true;
    }

    /**
     * Build a single wrapper using Clang
     * @param {Object} wrapperConfig - Wrapper configuration
     * @returns {Promise<boolean>} Success status
     */
    async buildWrapperClang(wrapperConfig) {
        const flags = this.getClangFlags();

        // Single step compilation and linking
        const args = [
            ...flags.compile.filter(f => f !== '-c'), // Remove -c flag for direct linking
            ...flags.include,
            ...flags.defines,
            ...flags.optimization,
            ...flags.link,
            ...flags.libraries,
            `${flags.output.dll}`,
            `"${wrapperConfig.output}"`,
            `"${wrapperConfig.source}"`
        ];

        console.log(`🔨 Compiling: ${this.compiler.command} ${args.join(' ')}`);

        const result = await this.executeCommand(this.compiler.command, args);
        if (!result.success) {
            console.error('❌ Compilation failed:', result.stderr);
            return false;
        }

        return true;
    }

    /**
     * Build a single wrapper using MinGW/GCC
     * @param {Object} wrapperConfig - Wrapper configuration
     * @returns {Promise<boolean>} Success status
     */
    async buildWrapperMinGW(wrapperConfig) {
        const flags = this.getMinGWFlags();

        // Single step compilation and linking
        const args = [
            ...flags.compile.filter(f => f !== '-c'), // Remove -c flag for direct linking
            ...flags.include,
            ...flags.defines,
            ...flags.optimization,
            ...flags.link,
            ...flags.libraries,
            `${flags.output.dll}`,
            `"${wrapperConfig.output}"`,
            `"${wrapperConfig.source}"`
        ];

        console.log(`🔨 Compiling: ${this.compiler.command} ${args.join(' ')}`);

        const result = await this.executeCommand(this.compiler.command, args);
        if (!result.success) {
            console.error('❌ Compilation failed:', result.stderr);
            return false;
        }

        return true;
    }

    /**
     * Build a single wrapper
     * @param {Object} wrapperConfig - Wrapper configuration
     * @returns {Promise<boolean>} Success status
     */
    async buildWrapper(wrapperConfig) {
        if (!this.compiler) {
            throw new Error('Compiler not detected. Call detectCompiler() first.');
        }

        try {
            switch (this.compiler.type) {
                case 'msvc':
                    return await this.buildWrapperMSVC(wrapperConfig);
                case 'clang':
                    return await this.buildWrapperClang(wrapperConfig);
                case 'mingw':
                case 'gcc':
                    return await this.buildWrapperMinGW(wrapperConfig);
                default:
                    throw new Error(`Unsupported compiler type: ${this.compiler.type}`);
            }
        } catch (error) {
            console.error(`❌ Error building ${wrapperConfig.name}:`, error.message);
            return false;
        }
    }

    /**
     * Execute a command and return the result
     * @param {string} command - Command to execute
     * @param {Array} args - Command arguments
     * @returns {Promise<Object>} Command result
     */
    async executeCommand(command, args = []) {
        return new Promise((resolve) => {
            const proc = spawn(command, args, {
                stdio: 'pipe',
                shell: true, // Important for Windows
                env: process.env
            });

            let stdout = '';
            let stderr = '';

            if (proc.stdout) {
                proc.stdout.on('data', (data) => {
                    stdout += data.toString();
                });
            }

            if (proc.stderr) {
                proc.stderr.on('data', (data) => {
                    stderr += data.toString();
                });
            }

            proc.on('close', (code) => {
                resolve({
                    success: code === 0,
                    code,
                    stdout: stdout.trim(),
                    stderr: stderr.trim()
                });
            });

            proc.on('error', (error) => {
                resolve({
                    success: false,
                    code: -1,
                    stdout: '',
                    stderr: error.message,
                    error
                });
            });
        });
    }

    /**
     * Get default raylib include path for Windows
     * @returns {string} Default include path
     */
    getDefaultRaylibInclude() {
        return process.env.RAYLIB_INCLUDE ||
            'assets/raylib/include' ||
            'C:/raylib/include';
    }

    /**
     * Get default raylib library path for Windows
     * @returns {string} Default library path
     */
    getDefaultRaylibLib() {
        return process.env.RAYLIB_LIB ||
            'assets/raylib/lib' ||
            'C:/raylib/lib';
    }

    /**
     * Validate Windows-specific build configuration
     * @returns {Object} Validation result
     */
    validateConfiguration() {
        const baseValidation = super.validateConfiguration();
        const errors = [...baseValidation.errors];
        const warnings = [...baseValidation.warnings];

        // Check for Windows-specific raylib libraries
        const requiredLibs = ['raylib.lib', 'raylib.dll'];
        for (const lib of requiredLibs) {
            const libPath = join(this.config.raylibLib, lib);
            // Note: We don't fail if these don't exist as they might be system-installed
        }

        // Check for Visual Studio environment if using MSVC
        if (this.compiler && this.compiler.type === 'msvc') {
            if (!process.env.VCINSTALLDIR && !process.env.VS160COMNTOOLS && !process.env.VS170COMNTOOLS) {
                warnings.push('Visual Studio environment variables not detected. Make sure to run from Developer Command Prompt.');
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
}

export default WindowsBuilder;