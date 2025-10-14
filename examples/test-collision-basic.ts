import Raylib from '../src/Raylib'
import Vector3 from '../src/math/Vector3'
import { BoundingBox } from '../src/types'

const rl = new Raylib()

// Initialize window
const result = rl.initWindow(400, 300, "Basic Collision Test")
if (result.isErr()) {
    console.error("Failed to initialize window:", result.error.message)
    process.exit(1)
}

console.log("Testing collision detection functions...")

// Test sphere-sphere collision
const sphere1 = new Vector3(0, 0, 0)
const sphere2 = new Vector3(1, 0, 0)
const radius = 1.0

const sphereCollision = rl.checkCollisionSpheres(sphere1, radius, sphere2, radius)
console.log("Sphere-Sphere collision (should be true):", sphereCollision.unwrapOr(false))

// Test distant spheres
const sphere3 = new Vector3(10, 0, 0)
const distantCollision = rl.checkCollisionSpheres(sphere1, radius, sphere3, radius)
console.log("Distant spheres collision (should be false):", distantCollision.unwrapOr(true))

// Test box-box collision
const box1: BoundingBox = {
    min: { x: -1, y: -1, z: -1 },
    max: { x: 1, y: 1, z: 1 }
}

const box2: BoundingBox = {
    min: { x: 0, y: 0, z: 0 },
    max: { x: 2, y: 2, z: 2 }
}

const boxCollision = rl.checkCollisionBoxes(box1, box2)
console.log("Box-Box collision (should be true):", boxCollision.unwrapOr(false))

// Test box-sphere collision
const boxSphereCollision = rl.checkCollisionBoxSphere(box1, sphere1, radius)
console.log("Box-Sphere collision (should be true):", boxSphereCollision.unwrapOr(false))

console.log("All collision tests completed successfully!")

// Cleanup
rl.closeWindow()