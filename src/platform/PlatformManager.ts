import * as path from 'path';
import * as fs from 'fs';

export interface PlatformInfo {
    os: 'windows' | 'linux' | 'darwin';
    arch: 'x64' | 'arm64';
    libraryExtension: '.dll' | '.so' | '.dylib';
    executableExtension: '.exe' | '';
    pathSeparator: '\\' | '/';
}

export interface LibraryPaths {
    raylibWrapper: string;
    textureWrapper: string;
    renderTextureWrapper: string;
    modelWrapper: string;
    rayCollisionWrapper: string;
    meshCollisionWrapper: string;
    triangleWrapper: string;
}

export class PlatformNotSupportedError extends Error {
    constructor(platform: string, supportedPlatforms: string[]) {
        super(`Platform '${platform}' is not supported. Supported platforms: ${supportedPlatforms.join(', ')}`);
        this.name = 'PlatformNotSupportedError';
    }
}

export class LibraryNotFoundError extends Error {
    constructor(libraryPath: string, platform: string) {
        const installInstructions = PlatformManager.getInstallationInstructions(platform);
        super(`Library not found at '${libraryPath}'. ${installInstructions}`);
        this.name = 'LibraryNotFoundError';
    }
}

export class RaylibNotFoundError extends Error {
    constructor(platform: string) {
        const installInstructions = PlatformManager.getRaylibInstallationInstructions(platform);
        super(`Raylib not found on system. ${installInstructions}`);
        this.name = 'RaylibNotFoundError';
    }
}

export class PlatformManager {
    private static _platformInfo: PlatformInfo | null = null;
    private static _debugMode: boolean = process.env.RAYLIB_DEBUG === 'true';

    /**
     * Detects the current platform information
     */
    static detectPlatform(): PlatformInfo {
        if (this._platformInfo) {
            return this._platformInfo;
        }

        const platform = process.platform;
        const arch = process.arch;

        let os: PlatformInfo['os'];
        let libraryExtension: PlatformInfo['libraryExtension'];
        let executableExtension: PlatformInfo['executableExtension'];
        let pathSeparator: PlatformInfo['pathSeparator'];

        switch (platform) {
            case 'win32':
                os = 'windows';
                libraryExtension = '.dll';
                executableExtension = '.exe';
                pathSeparator = '\\';
                break;
            case 'linux':
                os = 'linux';
                libraryExtension = '.so';
                executableExtension = '';
                pathSeparator = '/';
                break;
            case 'darwin':
                os = 'darwin';
                libraryExtension = '.dylib';
                executableExtension = '';
                pathSeparator = '/';
                break;
            default:
                throw new Error(`Unsupported platform: ${platform}. Supported platforms: windows, linux, darwin`);
        }

        let normalizedArch: PlatformInfo['arch'];
        switch (arch) {
            case 'x64':
                normalizedArch = 'x64';
                break;
            case 'arm64':
                normalizedArch = 'arm64';
                break;
            default:
                throw new Error(`Unsupported architecture: ${arch}. Supported architectures: x64, arm64`);
        }

        this._platformInfo = {
            os,
            arch: normalizedArch,
            libraryExtension,
            executableExtension,
            pathSeparator
        };

        return this._platformInfo;
    }

    /**
     * Generates platform-specific library paths
     */
    static getLibraryPaths(basePath: string = 'assets'): LibraryPaths {
        const platformInfo = this.detectPlatform();
        const ext = platformInfo.libraryExtension;

        return {
            raylibWrapper: path.join(basePath, `raylib-wrapper${ext}`),
            textureWrapper: path.join(basePath, `texture-wrapper${ext}`),
            renderTextureWrapper: path.join(basePath, `render-texture-wrapper${ext}`),
            modelWrapper: path.join(basePath, `model-wrapper${ext}`),
            rayCollisionWrapper: path.join(basePath, `ray-collision-wrapper${ext}`),
            meshCollisionWrapper: path.join(basePath, `mesh-collision-wrapper${ext}`),
            triangleWrapper: path.join(basePath, `triangle-wrapper${ext}`),
        };
    }

    /**
     * Gets the platform identifier string (e.g., "windows-x64", "darwin-arm64")
     */
    static getPlatformIdentifier(): string {
        const platformInfo = this.detectPlatform();
        return `${platformInfo.os}-${platformInfo.arch}`;
    }

    /**
     * Gets the platform-specific path to the main raylib library
     */
    static getRaylibPath(basePath: string = 'assets'): string {
        const platformInfo = this.detectPlatform();
        const ext = platformInfo.libraryExtension;

        // Platform-specific library names
        let libraryName: string;
        switch (platformInfo.os) {
            case 'windows':
                libraryName = `raylib${ext}`;  // raylib.dll
                break;
            case 'linux':
                libraryName = `libraylib${ext}`;  // libraylib.so
                break;
            case 'darwin':
                libraryName = `libraylib${ext}`;  // libraylib.dylib
                break;
            default:
                libraryName = `libraylib${ext}`;
        }

        return path.join(basePath, 'raylib', 'lib', libraryName);
    }

    /**
     * Gets prebuilt library paths for the current platform
     */
    static getPrebuiltLibraryPaths(basePath: string = 'assets'): LibraryPaths {
        const platformId = this.getPlatformIdentifier();
        const prebuiltPath = path.join(basePath, 'prebuilt', platformId);
        return this.getLibraryPaths(prebuiltPath);
    }

    /**
     * Validates if a library file exists at the specified path
     */
    static validateLibraryExists(libraryPath: string): boolean {
        try {
            const exists = fs.existsSync(libraryPath);
            this.log(`Library validation for '${libraryPath}': ${exists ? 'EXISTS' : 'NOT FOUND'}`);
            return exists;
        } catch (error) {
            this.log(`Error validating library '${libraryPath}': ${error}`);
            return false;
        }
    }

    /**
     * Validates all libraries in the provided LibraryPaths object
     */
    static validateAllLibraries(libraryPaths: LibraryPaths): { valid: boolean; missing: string[] } {
        const missing: string[] = [];

        for (const [name, path] of Object.entries(libraryPaths)) {
            if (!this.validateLibraryExists(path)) {
                missing.push(`${name}: ${path}`);
            }
        }

        const valid = missing.length === 0;
        this.log(`Library validation complete. Valid: ${valid}, Missing: ${missing.length}`);

        return { valid, missing };
    }

    /**
     * Gets platform-specific installation instructions
     */
    static getInstallationInstructions(platform: string): string {
        switch (platform) {
            case 'windows':
                return 'Please install raylib using vcpkg or download prebuilt binaries. ' +
                    'For vcpkg: vcpkg install raylib. ' +
                    'Make sure you have Visual Studio Build Tools or MinGW installed.';
            case 'linux':
                return 'Please install raylib using your package manager. ' +
                    'Ubuntu/Debian: sudo apt install libraylib-dev. ' +
                    'Fedora: sudo dnf install raylib-devel. ' +
                    'Arch: sudo pacman -S raylib.';
            case 'darwin':
                return 'Please install raylib using Homebrew: brew install raylib. ' +
                    'Make sure you have Xcode Command Line Tools installed.';
            default:
                return 'Please refer to the raylib documentation for installation instructions.';
        }
    }

    /**
     * Gets raylib-specific installation instructions
     */
    static getRaylibInstallationInstructions(platform: string): string {
        const baseInstructions = this.getInstallationInstructions(platform);
        return `${baseInstructions} After installation, try rebuilding the native wrappers using 'npm run build'.`;
    }

    /**
     * Logs debug information if debug mode is enabled
     */
    private static log(message: string): void {
        if (this._debugMode) {
            console.log(`[PlatformManager] ${message}`);
        }
    }

    /**
     * Enables or disables debug logging
     */
    static setDebugMode(enabled: boolean): void {
        this._debugMode = enabled;
    }

    /**
     * Gets all supported platforms
     */
    static getSupportedPlatforms(): string[] {
        return ['windows', 'linux', 'darwin'];
    }

    /**
     * Gets all supported architectures
     */
    static getSupportedArchitectures(): string[] {
        return ['x64', 'arm64'];
    }

    /**
     * Checks if the current platform is supported
     */
    static isPlatformSupported(): boolean {
        try {
            this.detectPlatform();
            return true;
        } catch (error) {
            return false;
        }
    }
}