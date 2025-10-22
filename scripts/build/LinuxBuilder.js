#!/usr/bin/env node

import { PlatformBuilder } from './PlatformBuilder.js';
import { CompilerDetector } from './CompilerDetector.js';
import { spawn } from 'child_process';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * Linux-specific builder with GCC and Clang support
 */
export class LinuxBuilder extends PlatformBuilder {
    constructor(config = {}) {
        super(config);
        this.supportedCompilers = ['gcc', 'clang'];
    }

    /**
     * Detect available compiler for Linux
     * @returns {Promise<Object|null>} Compiler information or null
     */
    async detectCompiler() {
        console.log('🔍 Detecting Linux compilers...');

        // Try to detect compilers in order of preference (GCC first on Linux)
        const detectors = [
            () => CompilerDetector.detectGCC(),
            () => CompilerDetector.detectClang()
        ];

        for (const detector of detectors) {
            try {
                const compiler = await detector();
                if (compiler) {
                    console.log(`✅ Found ${compiler.name} ${compiler.version}`);
                    return this.enhanceCompilerInfo(compiler);
                }
            } catch (error) {
                console.warn(`⚠️  Error detecting compiler: ${error.message}`);
            }
        }

        console.error('❌ No suitable compiler found for Linux');
        console.log('\n💡 Installation suggestions:');
        const instructions = CompilerDetector.getInstallationInstructions();
        instructions.instructions.forEach(instruction => {
            console.log(`   - ${instruction}`);
        });

        return null;
    }

    /**
     * Enhance compiler info with Linux-specific details
     * @param {Object} compiler - Basic compiler info
     * @returns {Object} Enhanced compiler info
     */
    enhanceCompilerInfo(compiler) {
        const enhanced = { ...compiler };

        switch (compiler.name) {
            case 'gcc':
                enhanced.flags = this.getGCCFlags();
                break;

            case 'clang':
                enhanced.flags = this.getClangFlags();
                break;
        }

        enhanced.outputFlag = '-o';
        enhanced.libraryFlag = '-L';
        enhanced.includeFlag = '-I';

        return enhanced;
    }

    /**
     * Get GCC-specific compilation flags for Linux
     * @returns {Object} GCC flags
     */
    getGCCFlags() {
        return {
            shared: ['-shared'],
            pic: ['-fPIC'],
            optimization: ['-O2'],
            debug: ['-g', '-DDEBUG'],
            platform: ['-D_LINUX', '-D_GNU_SOURCE'],
            runtime: ['-pthread'], // Enable threading support
            warnings: ['-Wall', '-Wextra'],
            additional: ['-std=c99'] // Use C99 standard
        };
    }

    /**
     * Get Clang-specific compilation flags for Linux
     * @returns {Object} Clang flags
     */
    getClangFlags() {
        return {
            shared: ['-shared'],
            pic: ['-fPIC'],
            optimization: ['-O2'],
            debug: ['-g', '-DDEBUG'],
            platform: ['-D_LINUX', '-D_GNU_SOURCE'],
            runtime: ['-pthread'],
            warnings: ['-Wall', '-Wextra'],
            additional: ['-std=c99']
        };
    }

    /**
     * Build a single wrapper using Linux-specific compilation
     * @param {Object} wrapperConfig - Wrapper configuration
     * @returns {Promise<boolean>} Success status
     */
    async buildWrapper(wrapperConfig) {
        if (!this.compiler) {
            throw new Error('No compiler available');
        }

        const command = this.buildCompilationCommand(wrapperConfig);
        console.log(`🔨 Compiling ${wrapperConfig.name} with ${this.compiler.name}...`);

        if (this.config.verbose) {
            console.log(`📝 Command: ${command.join(' ')}`);
        }

        return await this.executeCompilation(command);
    }

    /**
     * Build compilation command for Linux
     * @param {Object} wrapperConfig - Wrapper configuration
     * @returns {Array} Compilation command array
     */
    buildCompilationCommand(wrapperConfig) {
        const compiler = this.compiler;
        const flags = compiler.flags;
        const command = [compiler.command];

        // Add compilation flags first
        command.push(...flags.shared);
        command.push(...flags.pic);
        command.push(...flags.platform);
        command.push(...flags.runtime);
        command.push(...flags.additional);

        // Add optimization or debug flags
        if (this.config.debug) {
            command.push(...flags.debug);
        } else {
            command.push(...flags.optimization);
        }

        // Add warnings
        command.push(...flags.warnings);

        // Add include paths
        command.push(`${compiler.includeFlag}${this.config.raylibInclude}`);

        // Add system include paths
        this.addSystemIncludes(command, compiler);

        // Add library paths
        command.push(`${compiler.libraryFlag}${this.config.raylibLib}`);

        // Add source file
        command.push(wrapperConfig.source);

        // Add output specification
        command.push(compiler.outputFlag, wrapperConfig.output);

        // Add libraries
        command.push('-lraylib');

        // Add Linux-specific libraries
        this.addLinuxLibraries(command);

        return command;
    }

    /**
     * Add system include paths for Linux
     * @param {Array} command - Command array to modify
     * @param {Object} compiler - Compiler information
     */
    addSystemIncludes(command, compiler) {
        // Common system include paths
        const systemIncludes = [
            '/usr/include',
            '/usr/local/include'
        ];

        // Add X11 includes if available
        const x11Includes = [
            '/usr/include/X11',
            '/usr/X11R6/include'
        ];

        x11Includes.forEach(includePath => {
            if (existsSync(includePath)) {
                command.push(`${compiler.includeFlag}${includePath}`);
            }
        });
    }

    /**
     * Add Linux-specific libraries to compilation command
     * @param {Array} command - Command array to modify
     */
    addLinuxLibraries(command) {
        const linuxLibs = [
            'GL',      // OpenGL
            'X11',     // X Window System
            'Xrandr',  // X11 RandR extension
            'Xinerama', // X11 Xinerama extension
            'Xi',      // X11 Input extension
            'Xxf86vm', // X11 XF86 video mode extension
            'Xcursor', // X11 cursor management
            'm',       // Math library
            'pthread', // POSIX threads
            'dl',      // Dynamic linking
            'rt'       // Real-time extensions
        ];

        linuxLibs.forEach(lib => {
            command.push(`-l${lib}`);
        });
    }

    /**
     * Execute compilation command
     * @param {Array} command - Compilation command
     * @returns {Promise<boolean>} Success status
     */
    async executeCompilation(command) {
        return new Promise((resolve) => {
            const [executable, ...args] = command;
            const proc = spawn(executable, args, {
                stdio: this.config.verbose ? 'inherit' : 'pipe'
            });

            let stderr = '';

            if (!this.config.verbose && proc.stderr) {
                proc.stderr.on('data', (data) => {
                    stderr += data.toString();
                });
            }

            proc.on('close', (code) => {
                if (code === 0) {
                    resolve(true);
                } else {
                    if (!this.config.verbose && stderr) {
                        console.error('❌ Compilation error:');
                        console.error(stderr);
                    }
                    resolve(false);
                }
            });

            proc.on('error', (error) => {
                console.error(`❌ Failed to start compiler: ${error.message}`);
                resolve(false);
            });
        });
    }

    /**
     * Get default raylib include path for Linux
     * @returns {string} Default include path
     */
    getDefaultRaylibInclude() {
        const possiblePaths = [
            process.env.RAYLIB_INCLUDE,
            join(process.cwd(), 'assets', 'raylib', 'include'),
            '/usr/local/include',
            '/usr/include/raylib',
            '/usr/local/include/raylib'
        ].filter(Boolean);

        for (const path of possiblePaths) {
            if (existsSync(join(path, 'raylib.h'))) {
                return path;
            }
        }

        return possiblePaths[1]; // Default to local assets
    }

    /**
     * Get default raylib library path for Linux
     * @returns {string} Default library path
     */
    getDefaultRaylibLib() {
        const possiblePaths = [
            process.env.RAYLIB_LIB,
            join(process.cwd(), 'assets', 'raylib', 'lib'),
            '/usr/local/lib',
            '/usr/lib',
            '/usr/lib/x86_64-linux-gnu'
        ].filter(Boolean);

        for (const path of possiblePaths) {
            if (existsSync(path)) {
                return path;
            }
        }

        return possiblePaths[1]; // Default to local assets
    }

    /**
     * Get platform-specific compilation flags
     * @returns {Object} Compilation flags
     */
    getCompilationFlags() {
        if (!this.compiler) {
            throw new Error('Compiler not detected');
        }

        return this.compiler.flags;
    }

    /**
     * Validate Linux-specific build environment
     * @returns {Object} Validation result
     */
    validateConfiguration() {
        const baseValidation = super.validateConfiguration();

        // Add Linux-specific validations
        const linuxErrors = [];
        const linuxWarnings = [];

        // Check for essential development packages
        this.checkDevelopmentPackages(linuxWarnings);

        // Check for X11 development libraries
        this.checkX11Libraries(linuxWarnings);

        // Check for OpenGL libraries
        this.checkOpenGLLibraries(linuxWarnings);

        return {
            valid: baseValidation.valid && linuxErrors.length === 0,
            errors: [...baseValidation.errors, ...linuxErrors],
            warnings: [...baseValidation.warnings, ...linuxWarnings]
        };
    }

    /**
     * Check for essential development packages
     * @param {Array} warnings - Warnings array to populate
     */
    checkDevelopmentPackages(warnings) {
        const essentialHeaders = [
            '/usr/include/stdio.h',
            '/usr/include/stdlib.h'
        ];

        const missingHeaders = essentialHeaders.filter(header => !existsSync(header));
        if (missingHeaders.length > 0) {
            warnings.push('Essential development headers not found. Install build-essential or equivalent.');
        }
    }

    /**
     * Check for X11 development libraries
     * @param {Array} warnings - Warnings array to populate
     */
    checkX11Libraries(warnings) {
        const x11Paths = [
            '/usr/include/X11/Xlib.h',
            '/usr/X11R6/include/X11/Xlib.h'
        ];

        const hasX11 = x11Paths.some(path => existsSync(path));
        if (!hasX11) {
            warnings.push('X11 development libraries not found. Install libx11-dev or equivalent.');
        }
    }

    /**
     * Check for OpenGL libraries
     * @param {Array} warnings - Warnings array to populate
     */
    checkOpenGLLibraries(warnings) {
        const glPaths = [
            '/usr/include/GL/gl.h',
            '/usr/include/OpenGL/gl.h'
        ];

        const hasOpenGL = glPaths.some(path => existsSync(path));
        if (!hasOpenGL) {
            warnings.push('OpenGL development libraries not found. Install libgl1-mesa-dev or equivalent.');
        }
    }

    /**
     * Get Linux distribution information
     * @returns {Promise<Object>} Distribution info
     */
    async getDistributionInfo() {
        try {
            const result = await CompilerDetector.executeCommand('lsb_release', ['-a']);
            if (result.success) {
                return this.parseDistributionInfo(result.stdout);
            }
        } catch (error) {
            // Fallback methods
        }

        // Try reading /etc/os-release
        try {
            const fs = await import('fs/promises');
            const osRelease = await fs.readFile('/etc/os-release', 'utf8');
            return this.parseOSRelease(osRelease);
        } catch (error) {
            return { name: 'Unknown', version: 'Unknown', error };
        }
    }

    /**
     * Parse distribution info from lsb_release output
     * @param {string} output - lsb_release output
     * @returns {Object} Parsed distribution info
     */
    parseDistributionInfo(output) {
        const lines = output.split('\n');
        const info = {};

        lines.forEach(line => {
            const [key, value] = line.split(':').map(s => s.trim());
            if (key && value) {
                info[key.toLowerCase()] = value;
            }
        });

        return {
            name: info['distributor id'] || 'Unknown',
            version: info['release'] || 'Unknown',
            codename: info['codename'] || 'Unknown'
        };
    }

    /**
     * Parse OS release info
     * @param {string} content - /etc/os-release content
     * @returns {Object} Parsed OS info
     */
    parseOSRelease(content) {
        const lines = content.split('\n');
        const info = {};

        lines.forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                info[key] = value.replace(/"/g, '');
            }
        });

        return {
            name: info.NAME || info.ID || 'Unknown',
            version: info.VERSION || info.VERSION_ID || 'Unknown'
        };
    }

    /**
     * Get package manager installation commands for current distribution
     * @returns {Promise<Object>} Installation commands
     */
    async getInstallationCommands() {
        const distro = await this.getDistributionInfo();
        const distroName = distro.name.toLowerCase();

        if (distroName.includes('ubuntu') || distroName.includes('debian')) {
            return {
                packageManager: 'apt',
                updateCommand: 'sudo apt update',
                installCommands: [
                    'sudo apt install build-essential',
                    'sudo apt install libraylib-dev',
                    'sudo apt install libx11-dev libxrandr-dev libxinerama-dev libxi-dev libxxf86vm-dev libxcursor-dev',
                    'sudo apt install libgl1-mesa-dev'
                ]
            };
        } else if (distroName.includes('fedora') || distroName.includes('rhel') || distroName.includes('centos')) {
            return {
                packageManager: 'dnf/yum',
                updateCommand: 'sudo dnf update',
                installCommands: [
                    'sudo dnf groupinstall "Development Tools"',
                    'sudo dnf install raylib-devel',
                    'sudo dnf install libX11-devel libXrandr-devel libXinerama-devel libXi-devel libXxf86vm-devel libXcursor-devel',
                    'sudo dnf install mesa-libGL-devel'
                ]
            };
        } else if (distroName.includes('arch')) {
            return {
                packageManager: 'pacman',
                updateCommand: 'sudo pacman -Sy',
                installCommands: [
                    'sudo pacman -S base-devel',
                    'sudo pacman -S raylib',
                    'sudo pacman -S libx11 libxrandr libxinerama libxi libxxf86vm libxcursor',
                    'sudo pacman -S mesa'
                ]
            };
        } else {
            return {
                packageManager: 'unknown',
                updateCommand: 'Update your package manager',
                installCommands: [
                    'Install build tools for your distribution',
                    'Install raylib development package',
                    'Install X11 development libraries',
                    'Install OpenGL development libraries'
                ]
            };
        }
    }
}

export default LinuxBuilder;