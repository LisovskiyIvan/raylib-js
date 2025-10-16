#!/usr/bin/env node

const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

const RAYLIB_PATH = path.join(__dirname, '..', 'assets', 'raylib')
const WRAPPER_SOURCE = path.join(__dirname, '..', 'src', 'wrappers', 'models', 'mesh-collision-wrapper.c')
const OUTPUT_PATH = path.join(__dirname, '..', 'assets', 'mesh-collision-wrapper.dylib')

console.log('🔨 Compiling mesh collision wrapper...')
console.log(`   Source: ${WRAPPER_SOURCE}`)
console.log(`   Output: ${OUTPUT_PATH}`)

// Check if source file exists
if (!fs.existsSync(WRAPPER_SOURCE)) {
    console.error(`❌ Source file not found: ${WRAPPER_SOURCE}`)
    process.exit(1)
}

// Check if raylib exists
if (!fs.existsSync(RAYLIB_PATH)) {
    console.error(`❌ Raylib not found at: ${RAYLIB_PATH}`)
    process.exit(1)
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
        -Wno-deprecated-declarations`

    console.log('\n📦 Running compilation...')
    execSync(command, { stdio: 'inherit' })
    
    console.log('\n✅ Mesh collision wrapper compiled successfully!')
    console.log(`   Output: ${OUTPUT_PATH}`)
} catch (error) {
    console.error('\n❌ Compilation failed!')
    console.error(error.message)
    process.exit(1)
}
