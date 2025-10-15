import Raylib from '../src/Raylib'
import Vector3 from '../src/math/Vector3'
import { BoundingBox } from '../src/types'

const rl = new Raylib()

// Initialize window (required for Raylib)
const result = rl.initWindow(800, 600, "Ray Collision Benchmark")
if (result.isErr()) {
    console.error("Failed to initialize window:", result.error.message)
    process.exit(1)
}

// Test data
const rayPosition = new Vector3(0, 0, 0)
const rayDirection = new Vector3(1, 0, 0).normalize()

const sphereCenter = new Vector3(5, 0, 0)
const sphereRadius = 1.5

const box: BoundingBox = {
    min: { x: 4, y: -1, z: -1 },
    max: { x: 6, y: 1, z: 1 }
}

const triangleP1 = new Vector3(4, -1, 0)
const triangleP2 = new Vector3(5, 1, 0)
const triangleP3 = new Vector3(6, -1, 0)

// Benchmark configuration
const ITERATIONS = 100000

console.log("=".repeat(60))
console.log("Ray Collision Performance Benchmark")
console.log("=".repeat(60))
console.log(`Iterations: ${ITERATIONS.toLocaleString()}`)
console.log()

// Benchmark: Ray-Sphere Collision
console.log("Testing Ray-Sphere Collision...")
const sphereStart = performance.now()
for (let i = 0; i < ITERATIONS; i++) {
    const collision = rl.getRayCollisionSphere(rayPosition, rayDirection, sphereCenter, sphereRadius)
    collision.unwrap() // Force evaluation
}
const sphereEnd = performance.now()
const sphereTime = sphereEnd - sphereStart
const sphereOpsPerSec = (ITERATIONS / sphereTime) * 1000

console.log(`  Total time: ${sphereTime.toFixed(2)}ms`)
console.log(`  Avg per call: ${(sphereTime / ITERATIONS).toFixed(6)}ms`)
console.log(`  Operations/sec: ${sphereOpsPerSec.toLocaleString(undefined, { maximumFractionDigits: 0 })}`)
console.log()

// Benchmark: Ray-Box Collision
console.log("Testing Ray-Box Collision...")
const boxStart = performance.now()
for (let i = 0; i < ITERATIONS; i++) {
    const collision = rl.getRayCollisionBox(rayPosition, rayDirection, box)
    collision.unwrap() // Force evaluation
}
const boxEnd = performance.now()
const boxTime = boxEnd - boxStart
const boxOpsPerSec = (ITERATIONS / boxTime) * 1000

console.log(`  Total time: ${boxTime.toFixed(2)}ms`)
console.log(`  Avg per call: ${(boxTime / ITERATIONS).toFixed(6)}ms`)
console.log(`  Operations/sec: ${boxOpsPerSec.toLocaleString(undefined, { maximumFractionDigits: 0 })}`)
console.log()

// Benchmark: Ray-Triangle Collision
console.log("Testing Ray-Triangle Collision...")
const triangleStart = performance.now()
for (let i = 0; i < ITERATIONS; i++) {
    const collision = rl.getRayCollisionTriangle(rayPosition, rayDirection, triangleP1, triangleP2, triangleP3)
    collision.unwrap() // Force evaluation
}
const triangleEnd = performance.now()
const triangleTime = triangleEnd - triangleStart
const triangleOpsPerSec = (ITERATIONS / triangleTime) * 1000

console.log(`  Total time: ${triangleTime.toFixed(2)}ms`)
console.log(`  Avg per call: ${(triangleTime / ITERATIONS).toFixed(6)}ms`)
console.log(`  Operations/sec: ${triangleOpsPerSec.toLocaleString(undefined, { maximumFractionDigits: 0 })}`)
console.log()

// Summary
console.log("=".repeat(60))
console.log("Summary - Optimized API (2 FFI calls)")
console.log("=".repeat(60))
console.log(`Ray-Sphere:   ${sphereOpsPerSec.toLocaleString(undefined, { maximumFractionDigits: 0 })} ops/sec`)
console.log(`Ray-Box:      ${boxOpsPerSec.toLocaleString(undefined, { maximumFractionDigits: 0 })} ops/sec`)
console.log(`Ray-Triangle: ${triangleOpsPerSec.toLocaleString(undefined, { maximumFractionDigits: 0 })} ops/sec`)
console.log()
console.log("Performance characteristics:")
console.log(`  Average time per call: ${((sphereTime + boxTime + triangleTime) / (ITERATIONS * 3)).toFixed(6)}ms`)
console.log(`  FFI calls per operation: 2 (1 wrapper + 1 data getter)`)
console.log(`  Memory allocated per call: 56 bytes (6 floats for ray + 8 floats for result)`)
console.log()

// Cleanup
rl.closeWindow()
