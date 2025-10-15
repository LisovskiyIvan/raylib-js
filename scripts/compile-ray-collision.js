#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const RAYLIB_PATH = path.join(__dirname, '..', 'assets', 'raylib');
const WRAPPER_SOURCE = path.join(__dirname, '..', 'src', 'wrappers', 'ray-collision', 'ray-collision-wrapper.c');
const OUTPUT_PATH = path.join(__dirname, '..', 'assets', 'ray-collision-wrapper.dylib');

console.log('🔨 Compiling ray collision wrapper...');

// Check if source file exists
if (!fs.existsSync(WRAPPER_SOURCE)) {
    console.error(`❌ Source file not found: ${WRAPPER_SOURCE}`);
    process.exit(1);
}

// Check if raylib exists
if (!fs.existsSync(RAYLIB_PATH)) {
    console.error(`❌ Raylib not found at: ${RAYLIB_PATH}`);
    process.exit(1);
}

try {
    // Compile command for macOS
    const compileCommand = `clang -shared -o ${OUTPUT_PATH} ${WRAPPER_SOURCE} \
        -I${RAYLIB_PATH}/include \
        -L${RAYLIB_PATH}/lib \
        -lraylib \
        -framework OpenGL \
        -framework Cocoa \
        -framework IOKit \
        -framework CoreVideo \
        -framework CoreAudio \
        -framework CoreFoundation`;

    console.log('Running:', compileCommand);
    execSync(compileCommand, { stdio: 'inherit' });
    
    console.log('✅ Ray collision wrapper compiled successfully!');
    console.log(`📦 Output: ${OUTPUT_PATH}`);
} catch (error) {
    console.error('❌ Compilation failed:', error.message);
    process.exit(1);
}
