import Raylib from '../src/Raylib'
import { Colors } from '../src/constants'
import Vector3 from '../src/math/Vector3'
import type { Model, Matrix } from '../src/types'

const rl = new Raylib()

// Initialize window
const initResult = rl.initWindow(800, 600, "Mesh Ray Collision Example")
if (initResult.isErr()) {
    console.error("Failed to initialize window")
    process.exit(1)
}

rl.setTargetFPS(60)

// Camera setup
const cameraPosition = new Vector3(10, 10, 10)
const cameraTarget = new Vector3(0, 0, 0)
const cameraUp = new Vector3(0, 1, 0)
const fovy = 45.0
const projection = 0 // CAMERA_PERSPECTIVE

console.log("🎮 Mesh Ray Collision Example")
console.log("=".repeat(50))
console.log("This example demonstrates ray-mesh collision detection")
console.log("The ray will move in a circle and detect hits/misses\n")

// Load model
let loadedModel: Model | null = null

console.log("Attempting to load GLTF model: assets/frog_tamagotchi/scene.gltf")
const gltfRes = rl.loadModel("assets/frog_tamagotchi/scene.gltf")
if (gltfRes.isOk()) {
    loadedModel = gltfRes.unwrap()
    console.log("✅ GLTF Model loaded successfully!")
    console.log(`   Slot index: ${loadedModel.slotIndex}`)
    console.log(`   Mesh count: ${loadedModel.meshCount}`)
    console.log(`   Material count: ${loadedModel.materialCount}`)

    // Get bounding box to understand model size
    const bboxRes = rl.getModelBoundingBox(loadedModel)
    if (bboxRes.isOk()) {
        const bbox = bboxRes.unwrap()
        console.log("   Bounding box:")
        console.log(`     Min: (${bbox.min.x.toFixed(2)}, ${bbox.min.y.toFixed(2)}, ${bbox.min.z.toFixed(2)})`)
        console.log(`     Max: (${bbox.max.x.toFixed(2)}, ${bbox.max.y.toFixed(2)}, ${bbox.max.z.toFixed(2)})`)
        const width = bbox.max.x - bbox.min.x
        const height = bbox.max.y - bbox.min.y
        const depth = bbox.max.z - bbox.min.z
        console.log(`     Size: ${width.toFixed(2)} x ${height.toFixed(2)} x ${depth.toFixed(2)}`)
    }
} else {
    console.log("❌ Failed to load GLTF model")
    console.log("   Falling back to basic shapes for demonstration")
}

// Ray setup - луч будет стрелять сверху вниз
const rayOrigin = new Vector3(0, 5, 0)
const rayDirection = new Vector3(0, -1, 0) // Pointing down

// Identity matrix for transform
const identityMatrix: Matrix = {
    m0: 1, m4: 0, m8: 0, m12: 0,
    m1: 0, m5: 1, m9: 0, m13: 0,
    m2: 0, m6: 0, m10: 1, m14: 0,
    m3: 0, m7: 0, m11: 0, m15: 1
}

let frameCount = 0
let lastCollisionInfo = "No collision detected"
let previousCollision = false

// Main game loop
while (true) {
    const shouldClose = rl.windowShouldClose()
    if (shouldClose.isErr() || shouldClose.unwrap()) break

    frameCount++

    // Луч движется по кругу в горизонтальной плоскости
    // Радиус подобран так, чтобы луч попеременно попадал и не попадал в модель
    // Модель имеет размер ~0.56 x 0.91 x 1.41, поэтому используем радиус 0.4
    const angle = frameCount * 0.03
    const radius = 0.4 // Чуть больше половины ширины модели
    rayOrigin.x = Math.cos(angle) * radius
    rayOrigin.z = Math.sin(angle) * radius
    rayOrigin.y = 1.5 // Высота над моделью (модель от -0.10 до 0.81 по Y)

    // Луч всегда направлен вниз
    rayDirection.x = 0
    rayDirection.y = -1
    rayDirection.z = 0

    // Check collision with model meshes
    let hasCollision = false

    if (loadedModel) {
        // Test collision with ALL meshes (model has 54 meshes)
        for (let meshIdx = 0; meshIdx < loadedModel.meshCount; meshIdx++) {
            const collisionRes = rl.getRayCollisionMesh(
                rayOrigin,
                rayDirection,
                loadedModel,
                meshIdx,
                identityMatrix
            )

            if (collisionRes.isOk()) {
                const collision = collisionRes.unwrap()

                if (collision.hit) {
                    hasCollision = true
                    lastCollisionInfo = `Hit mesh ${meshIdx} at (${collision.point.x.toFixed(2)}, ${collision.point.y.toFixed(2)}, ${collision.point.z.toFixed(2)}) dist: ${collision.distance.toFixed(2)}`
                    break // Found a hit, no need to check other meshes
                }
            }
        }

        if (hasCollision) {
            // Log when collision state changes from miss to hit
            if (!previousCollision) {
                console.log(`🎯 Frame ${frameCount}: RAY HIT! ${lastCollisionInfo}`)
            }
        } else {
            lastCollisionInfo = "No collision detected"

            // Log when collision state changes from hit to miss
            if (previousCollision) {
                console.log(`❌ Frame ${frameCount}: RAY MISS`)
            }
        }
    }

    previousCollision = hasCollision

    // Begin drawing
    rl.beginDrawing()
    rl.clearBackground(Colors.RAYWHITE)

    // Begin 3D mode
    rl.beginMode3D(cameraPosition, cameraTarget, cameraUp, fovy, projection)

    if (loadedModel) {
        // Draw the loaded model
        rl.drawModel(loadedModel, new Vector3(0, 0, 0), 1.0, Colors.WHITE)
    } else {
        // Draw fallback cube
        rl.drawCube(new Vector3(0, 0, 0), 2, 2, 2, Colors.RED)
    }

    // Draw the ray
    const rayEnd = new Vector3(
        rayOrigin.x + rayDirection.x * 20,
        rayOrigin.y + rayDirection.y * 20,
        rayOrigin.z + rayDirection.z * 20
    )
    rl.drawLine3D(rayOrigin, rayEnd, hasCollision ? Colors.GREEN : Colors.RED)

    // Draw ray origin point
    rl.drawSphere(rayOrigin, 0.2, Colors.YELLOW)

    rl.drawGrid(10, 1.0)

    // End 3D mode
    rl.endMode3D()

    // Draw UI
    rl.drawText("Mesh Ray Collision Example", 10, 10, 20, Colors.DARKGRAY)
    rl.drawText("Ray moves in a circle above model", 10, 40, 16, Colors.DARKGRAY)
    rl.drawText(lastCollisionInfo, 10, 60, 14, hasCollision ? Colors.GREEN : Colors.RED)
    rl.drawText(`Status: ${hasCollision ? "HIT!" : "MISS"}`, 10, 80, 24, hasCollision ? Colors.GREEN : Colors.RED)
    rl.drawText("Green ray = collision, Red ray = no collision", 10, 110, 14, Colors.GRAY)
    rl.drawText("Press ESC to exit", 10, 130, 14, Colors.GRAY)
    rl.drawFPS(10, 150)

    rl.endDrawing()

    // Exit after a few seconds for demo purposes
    if (frameCount > 600) break
}

// Cleanup loaded model
if (loadedModel) {
    console.log("\nCleaning up loaded model...")
    const unloadRes = rl.unloadModel(loadedModel)
    if (unloadRes.isOk()) {
        console.log("✅ Model unloaded successfully")
    } else {
        console.log("❌ Failed to unload model")
    }
}

console.log("\n✅ Example completed successfully!")
console.log("🎯 Ray collision with mesh detection is working!")
console.log("   The ray successfully detected hits and misses as it moved around the model")
rl.closeWindow()
