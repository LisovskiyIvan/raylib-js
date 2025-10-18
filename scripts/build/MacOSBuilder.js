#!/usr/bin/env node

import { PlatformBuilder } from './PlatformBuilder.js';
import { CompilerDetector } from './CompilerDetector.js';
import { spawn } from 'child_process';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * macOS-specific builder with Clang support for both x64 and ARM64
 */
export class MacOSBuilder extends PlatformBuilder {
    constructor(config = {}) {
        super(config);
        this.supportedCompilers = ['clang', 'gcc'];
        this.supportedArchitectures = ['x64', 'arm64'];
    }

    /**
     * Detect available compiler for macOS
     * @returns {Promise<Object|null>} Compiler information or null
     */
    async detectCompiler() {
        console.log('🔍 Detecting macOS compilers...');

        // Try to detect compilers in order of preference (Clang first on macOS)
        const detectors = [
            () => CompilerDetector.detectClang(),
            () => CompilerDetector.detectGCC()
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

        console.error('❌ No suitable compiler found for macOS');
        console.log('\n💡 Installation suggestions:');
        console.log('   - Install Xcode Command Line Tools: xcode-select --install');
        console.log('   - Or install GCC via Homebrew: brew install gcc');

        return null;
    }

    /**
     * Enhance compiler info with macOS-specific details
     * @param {Object} compiler - Basic compiler info
     * @returns {Object} Enhanced compiler info
     */
    enhanceCompilerInfo(compiler) {
        const enhanced = { ...compiler };

        switch (compiler.name) {
            case 'clang':
                enhanced.flags = this.getClangFlags();
                break;

            case 'gcc':
                enhanced.flags = this.getGCCFlags();
                break;
        }

        enhanced.outputFlag = '-o';
        enhanced.libraryFlag = '-L';
        enhanced.includeFlag = '-I';

        return enhanced;
    }

    /**
     * Get Clang-specific compilation flags for macOS
     * @returns {Object} Clang flags
     */
    getClangFlags() {
        const arch = this.platform.arch;
        const isAppleSilicon = arch === 'arm64';

        return {
            shared: ['-shared'],
            pic: ['-fPIC'],
            optimization: ['-O2'],
            debug: ['-g', '-DDEBUG'],
            platform: ['-D_MACOS', '-D_DARWIN'],
            runtime: [],
            warnings: ['-Wall', '-Wextra'],
            additional: ['-std=c99'],
            frameworks: [
                '-framework', 'OpenGL',
                '-framework', 'Cocoa',
                '-framework', 'IOKit',
                '-framework', 'CoreVideo'
            ],
            architecture: isAppleSilicon ? ['-arch', 'arm64'] : ['-arch', 'x86_64']
        };
    }

    /**
     * Get GCC-specific compilation flags for macOS
     * @returns {Object} GCC flags
     */
    getGCCFlags() {
        return {
            shared: ['-shared'],
            pic: ['-fPIC'],
            optimization: ['-O2'],
            debug: ['-g', '-DDEBUG'],
            platform: ['-D_MACOS', '-D_DARWIN'],
            runtime: [],
            warnings: ['-Wall', '-Wextra'],
            additional: ['-std=c99'],
            frameworks: [
                '-framework', 'OpenGL',
                '-framework', 'Cocoa',
                '-framework', 'IOKit',
                '-framework', 'CoreVideo'
            ],
            architecture: [] // GCC on macOS typically doesn't need explicit arch flags
        };
    }

    /**
     * Build a single wrapper using macOS-specific compilation
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
     * Build compilation command for macOS
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
        command.push(...flags.additional);

        // Add architecture flags (important for Apple Silicon)
        if (flags.architecture && flags.architecture.length > 0) {
            command.push(...flags.architecture);
        }

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

        // Add macOS-specific frameworks
        command.push(...flags.frameworks);

        return command;
    }

    /**
     * Add system include paths for macOS
     * @param {Array} command - Command array to modify
     * @param {Object} compiler - Compiler information
     */
    addSystemIncludes(command, compiler) {
        // Xcode Command Line Tools includes
        const xcodeIncludes = [
            '/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk/usr/include',
            '/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk/usr/include'
        ];

        // Homebrew includes
        const homebrewIncludes = [
            '/opt/homebrew/include', // Apple Silicon Homebrew
            '/usr/local/include'     // Intel Homebrew
        ];

        // Add Xcode includes
        xcodeIncludes.forEach(includePath => {
            if (existsSync(includePath)) {
                command.push(`${compiler.includeFlag}${includePath}`);
            }
        });

        // Add Homebrew includes
        homebrewIncludes.forEach(includePath => {
            if (existsSync(includePath)) {
                command.push(`${compiler.includeFlag}${includePath}`);
            }
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
     * Get default raylib include path for macOS
     * @returns {string} Default include path
     */
    getDefaultRaylibInclude() {
        const possiblePaths = [
            process.env.RAYLIB_INCLUDE,
            join(process.cwd(), 'assets', 'raylib', 'include'),
            '/opt/homebrew/include',     // Apple Silicon Homebrew
            '/usr/local/include',        // Intel Homebrew
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
     * Get default raylib library path for macOS
     * @returns {string} Default library path
     */
    getDefaultRaylibLib() {
        const possiblePaths = [
            process.env.RAYLIB_LIB,
            join(process.cwd(), 'assets', 'raylib', 'lib'),
            '/opt/homebrew/lib',         // Apple Silicon Homebrew
            '/usr/local/lib'             // Intel Homebrew
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
     * Validate macOS-specific build environment
     * @returns {Object} Validation result
     */
    validateConfiguration() {
        const baseValidation = super.validateConfiguration();

        // Add macOS-specific validations
        const macosErrors = [];
        const macosWarnings = [];

        // Check for Xcode Command Line Tools
        this.checkXcodeCommandLineTools(macosWarnings);

        // Check for Homebrew (optional but recommended)
        this.checkHomebrew(macosWarnings);

        // Check for macOS SDK
        this.checkMacOSSDK(macosWarnings);

        // Check architecture compatibility
        this.checkArchitectureCompatibility(macosWarnings);

        return {
            valid: baseValidation.valid && macosErrors.length === 0,
            errors: [...baseValidation.errors, ...macosErrors],
            warnings: [...baseValidation.warnings, ...macosWarnings]
        };
    }

    /**
     * Check for Xcode Command Line Tools
     * @param {Array} warnings - Warnings array to populate
     */
    checkXcodeCommandLineTools(warnings) {
        const xcodeToolsPaths = [
            '/Applications/Xcode.app/Contents/Developer',
            '/Library/Developer/CommandLineTools'
        ];

        const hasXcodeTools = xcodeToolsPaths.some(path => existsSync(path));
        if (!hasXcodeTools) {
            warnings.push('Xcode Command Line Tools not found. Install with: xcode-select --install');
        } else {
            console.log('✅ Xcode Command Line Tools found');
        }
    }

    /**
     * Check for Homebrew installation
     * @param {Array} warnings - Warnings array to populate
     */
    checkHomebrew(warnings) {
        const homebrewPaths = [
            '/opt/homebrew/bin/brew', // Apple Silicon
            '/usr/local/bin/brew'     // Intel
        ];

        const hasHomebrew = homebrewPaths.some(path => existsSync(path));
        if (!hasHomebrew) {
            warnings.push('Homebrew not found. Consider installing for easier dependency management.');
        } else {
            console.log('✅ Homebrew found');
        }
    }

    /**
     * Check for macOS SDK
     * @param {Array} warnings - Warnings array to populate
     */
    checkMacOSSDK(warnings) {
        const sdkPaths = [
            '/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs',
            '/Library/Developer/CommandLineTools/SDKs'
        ];

        const hasSDK = sdkPaths.some(path => existsSync(path));
        if (!hasSDK) {
            warnings.push('macOS SDK not found. Ensure Xcode or Command Line Tools are properly installed.');
        } else {
            console.log('✅ macOS SDK found');
        }
    }

    /**
     * Check architecture compatibility
     * @param {Array} warnings - Warnings array to populate
     */
    checkArchitectureCompatibility(warnings) {
        const currentArch = this.platform.arch;
        const isAppleSilicon = currentArch === 'arm64';

        if (isAppleSilicon) {
            console.log('✅ Running on Apple Silicon (ARM64)');

            // Check if Rosetta 2 is available for x64 compatibility
            if (existsSync('/usr/bin/arch')) {
                console.log('✅ Rosetta 2 available for x64 compatibility');
            }
        } else {
            console.log('✅ Running on Intel (x64)');
        }

        // Check if we can build for both architectures (universal binary)
        if (this.compiler && this.compiler.name === 'clang') {
            console.log('✅ Clang supports universal binary compilation');
        }
    }

    /**
     * Build universal binary (both x64 and ARM64)
     * @param {Object} wrapperConfig - Wrapper configuration
     * @returns {Promise<boolean>} Success status
     */
    async buildUniversalBinary(wrapperConfig) {
        if (!this.compiler || this.compiler.name !== 'clang') {
            console.warn('⚠️  Universal binary requires Clang compiler');
            return await this.buildWrapper(wrapperConfig);
        }

        console.log(`🔨 Building universal binary for ${wrapperConfig.name}...`);

        // Build for x64
        const x64Output = wrapperConfig.output.replace('.dylib', '-x64.dylib');
        const x64Command = this.buildArchSpecificCommand(wrapperConfig, 'x86_64', x64Output);

        // Build for ARM64
        const arm64Output = wrapperConfig.output.replace('.dylib', '-arm64.dylib');
        const arm64Command = this.buildArchSpecificCommand(wrapperConfig, 'arm64', arm64Output);

        try {
            // Build x64 version
            console.log('🔨 Building x64 version...');
            const x64Success = await this.executeCompilation(x64Command);
            if (!x64Success) {
                console.error('❌ Failed to build x64 version');
                return false;
            }

            // Build ARM64 version
            console.log('🔨 Building ARM64 version...');
            const arm64Success = await this.executeCompilation(arm64Command);
            if (!arm64Success) {
                console.error('❌ Failed to build ARM64 version');
                return false;
            }

            // Combine into universal binary using lipo
            console.log('🔗 Creating universal binary...');
            const lipoCommand = [
                'lipo', '-create',
                x64Output, arm64Output,
                '-output', wrapperConfig.output
            ];

            const lipoSuccess = await this.executeCompilation(lipoCommand);
            if (!lipoSuccess) {
                console.error('❌ Failed to create universal binary');
                return false;
            }

            // Clean up intermediate files
            await this.cleanupIntermediateFiles([x64Output, arm64Output]);

            console.log('✅ Universal binary created successfully!');
            return true;

        } catch (error) {
            console.error(`❌ Error building universal binary: ${error.message}`);
            return false;
        }
    }

    /**
     * Build architecture-specific compilation command
     * @param {Object} wrapperConfig - Wrapper configuration
     * @param {string} arch - Target architecture (x86_64 or arm64)
     * @param {string} output - Output file path
     * @returns {Array} Compilation command array
     */
    buildArchSpecificCommand(wrapperConfig, arch, output) {
        const command = this.buildCompilationCommand({
            ...wrapperConfig,
            output
        });

        // Replace architecture flag
        const archIndex = command.findIndex(arg => arg === '-arch');
        if (archIndex !== -1 && archIndex + 1 < command.length) {
            command[archIndex + 1] = arch;
        } else {
            // Add architecture flag if not present
            command.splice(1, 0, '-arch', arch);
        }

        return command;
    }

    /**
     * Clean up intermediate files
     * @param {Array} files - Files to remove
     */
    async cleanupIntermediateFiles(files) {
        const fs = await import('fs/promises');

        for (const file of files) {
            try {
                await fs.unlink(file);
                console.log(`🗑️  Cleaned up: ${file}`);
            } catch (error) {
                console.warn(`⚠️  Could not clean up ${file}: ${error.message}`);
            }
        }
    }

    /**
     * Get macOS version information
     * @returns {Promise<Object>} macOS version info
     */
    async getMacOSVersion() {
        try {
            const result = await CompilerDetector.executeCommand('sw_vers');
            if (result.success) {
                return this.parseMacOSVersion(result.stdout);
            }
        } catch (error) {
            console.warn(`⚠️  Could not get macOS version: ${error.message}`);
        }

        return { name: 'macOS', version: 'Unknown' };
    }

    /**
     * Parse macOS version from sw_vers output
     * @param {string} output - sw_vers output
     * @returns {Object} Parsed version info
     */
    parseMacOSVersion(output) {
        const lines = output.split('\n');
        const info = {};

        lines.forEach(line => {
            const [key, value] = line.split(':').map(s => s.trim());
            if (key && value) {
                info[key] = value;
            }
        });

        return {
            name: info['ProductName'] || 'macOS',
            version: info['ProductVersion'] || 'Unknown',
            build: info['BuildVersion'] || 'Unknown'
        };
    }
}

export default MacOSBuilder;