#!/usr/bin/env bun

import { spawn } from 'child_process';

/**
 * Utility class for detecting and validating available compilers
 */
export class CompilerDetector {
    /**
     * Execute a command and return the result
     * @param {string} command - Command to execute
     * @param {Array} args - Command arguments
     * @param {Object} options - Spawn options
     * @returns {Promise<Object>} Command result
     */
    static async executeCommand(command, args = [], options = {}) {
        return new Promise((resolve) => {
            const proc = spawn(command, args, {
                stdio: 'pipe',
                ...options
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
     * Check if a compiler is available
     * @param {string} compiler - Compiler command
     * @param {Array} versionArgs - Arguments to get version
     * @returns {Promise<Object|null>} Compiler info or null
     */
    static async checkCompiler(compiler, versionArgs = ['--version']) {
        const result = await this.executeCommand(compiler, versionArgs);

        if (!result.success) {
            return null;
        }

        // Extract version information
        const output = result.stdout || result.stderr;
        let version = 'unknown';
        let name = compiler;

        // Parse version from common compiler outputs
        if (output.includes('clang')) {
            name = 'clang';
            const match = output.match(/clang version (\d+\.\d+\.\d+)/);
            if (match) version = match[1];
        } else if (output.includes('gcc')) {
            name = 'gcc';
            const match = output.match(/gcc.*?(\d+\.\d+\.\d+)/);
            if (match) version = match[1];
        } else if (output.includes('Microsoft')) {
            name = 'msvc';
            const match = output.match(/(\d+\.\d+\.\d+)/);
            if (match) version = match[1];
        } else if (output.includes('MinGW') || output.includes('mingw')) {
            name = 'mingw';
            const match = output.match(/(\d+\.\d+\.\d+)/);
            if (match) version = match[1];
        }

        return {
            command: compiler,
            name,
            version,
            available: true,
            output
        };
    }

    /**
     * Detect GCC compiler
     * @returns {Promise<Object|null>} GCC info or null
     */
    static async detectGCC() {
        return await this.checkCompiler('gcc');
    }

    /**
     * Detect Clang compiler
     * @returns {Promise<Object|null>} Clang info or null
     */
    static async detectClang() {
        return await this.checkCompiler('clang');
    }

    /**
     * Detect MSVC compiler (cl.exe)
     * @returns {Promise<Object|null>} MSVC info or null
     */
    static async detectMSVC() {
        // Try cl.exe directly
        let result = await this.checkCompiler('cl', []);
        if (result) return result;

        // Try with vcvars if available
        const vcvarsResult = await this.executeCommand('where', ['cl']);
        if (vcvarsResult.success) {
            return await this.checkCompiler('cl', []);
        }

        return null;
    }

    /**
     * Detect MinGW compiler
     * @returns {Promise<Object|null>} MinGW info or null
     */
    static async detectMinGW() {
        // Try different MinGW variants
        const variants = ['gcc', 'x86_64-w64-mingw32-gcc', 'mingw32-gcc'];

        for (const variant of variants) {
            const result = await this.checkCompiler(variant);
            if (result && (result.output.includes('MinGW') || result.output.includes('mingw'))) {
                return result;
            }
        }

        return null;
    }

    /**
     * Detect all available compilers for current platform
     * @returns {Promise<Array>} Array of available compilers
     */
    static async detectAllCompilers() {
        const platform = process.platform;
        const compilers = [];

        // Common compilers for all platforms
        const gccResult = await this.detectGCC();
        if (gccResult) compilers.push(gccResult);

        const clangResult = await this.detectClang();
        if (clangResult) compilers.push(clangResult);

        // Platform-specific compilers
        if (platform === 'win32') {
            const msvcResult = await this.detectMSVC();
            if (msvcResult) compilers.push(msvcResult);

            const mingwResult = await this.detectMinGW();
            if (mingwResult) compilers.push(mingwResult);
        }

        return compilers;
    }

    /**
     * Get the best compiler for current platform
     * @returns {Promise<Object|null>} Best compiler or null
     */
    static async getBestCompiler() {
        const platform = process.platform;
        const compilers = await this.detectAllCompilers();

        if (compilers.length === 0) {
            return null;
        }

        // Platform-specific preferences
        switch (platform) {
            case 'win32':
                // Prefer MSVC, then MinGW, then Clang, then GCC
                return compilers.find(c => c.name === 'msvc') ||
                    compilers.find(c => c.name === 'mingw') ||
                    compilers.find(c => c.name === 'clang') ||
                    compilers.find(c => c.name === 'gcc') ||
                    compilers[0];

            case 'darwin':
                // Prefer Clang (native), then GCC
                return compilers.find(c => c.name === 'clang') ||
                    compilers.find(c => c.name === 'gcc') ||
                    compilers[0];

            case 'linux':
                // Prefer GCC, then Clang
                return compilers.find(c => c.name === 'gcc') ||
                    compilers.find(c => c.name === 'clang') ||
                    compilers[0];

            default:
                return compilers[0];
        }
    }

    /**
     * Validate compiler for C compilation
     * @param {Object} compiler - Compiler info
     * @returns {Promise<boolean>} Validation result
     */
    static async validateCompiler(compiler) {
        if (!compiler || !compiler.command) {
            return false;
        }
        // This is a basic validation - in a real implementation,
        // you might want to create a temporary file and compile it
        const result = await this.executeCommand(compiler.command, ['--help']);
        return result.success;
    }

    /**
     * Get installation instructions for current platform
     * @returns {Object} Installation instructions
     */
    static getInstallationInstructions() {
        const platform = process.platform;

        switch (platform) {
            case 'win32':
                return {
                    platform: 'Windows',
                    instructions: [
                        'Install Visual Studio Build Tools or Visual Studio Community',
                        'Or install MinGW-w64: https://www.mingw-w64.org/',
                        'Or install LLVM/Clang: https://llvm.org/builds/',
                        'Make sure the compiler is in your PATH'
                    ],
                    commands: [
                        'winget install Microsoft.VisualStudio.2022.BuildTools',
                        'choco install mingw',
                        'choco install llvm'
                    ]
                };

            case 'darwin':
                return {
                    platform: 'macOS',
                    instructions: [
                        'Install Xcode Command Line Tools (includes Clang)',
                        'Or install GCC via Homebrew'
                    ],
                    commands: [
                        'xcode-select --install',
                        'brew install gcc'
                    ]
                };

            case 'linux':
                return {
                    platform: 'Linux',
                    instructions: [
                        'Install GCC or Clang via your package manager'
                    ],
                    commands: [
                        'sudo apt-get install build-essential  # Ubuntu/Debian',
                        'sudo yum groupinstall "Development Tools"  # CentOS/RHEL',
                        'sudo pacman -S base-devel  # Arch Linux',
                        'sudo zypper install -t pattern devel_basis  # openSUSE'
                    ]
                };

            default:
                return {
                    platform: 'Unknown',
                    instructions: ['Please install a C compiler for your platform'],
                    commands: []
                };
        }
    }
}

export default CompilerDetector;