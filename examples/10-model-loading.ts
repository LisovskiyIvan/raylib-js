import Raylib from '../src/Raylib'
import { Colors } from '../src/constants'
import Vector3 from '../src/math/Vector3'
import type { Model } from '../src/types'

const rl = new Raylib()

// Initialize window
const initResult = rl.initWindow(800, 600, "Model Loading Example")
if (initResult.isErr()) {
    console.error("Failed to initialize window")
    process.exit(1)
}

rl.setTargetFPS(60)
const cameraPosition = new Vector3(10, 10, 10)
const cameraTarget = new Vector3(0, 0, 0)

const cameraUp = new Vector3(0, 1, 0)
const fovy = 45.0
const projection = 0 // CAMERA_PERSPECTIVE

console.log("🎮 Model Loading Example with C Wrapper")
console.log("=" .repeat(50))

// Test model loading with new wrapper-based approach
let loadedModel: Model | null = null

console.log("Testing model loading with C wrapper...")

// First, let's test with a non-existent file to see error handling
console.log("\n1. Testing error handling with non-existent file:")
const testRes = rl.loadModel("nonexistent.obj")
if (testRes.isErr()) {
    console.log("✅ Error handling works correctly")
} else {
    console.log("❌ Unexpected success with non-existent file")
}

// Now try the GLTF model
console.log("\n2. Attempting to load GLTF model: assets/frog_tamagotchi/scene.gltf")
// const gltfRes = rl.loadModel("assets/frog_tamagotchi/scene.gltf")
const gltfRes = rl.loadModel("assets/models/phoenix_bird.glb")
if (gltfRes.isOk()) {
    loadedModel = gltfRes.unwrap()
    console.log("✅ GLTF Model loaded successfully!")
    console.log(`   Slot index: ${loadedModel.slotIndex}`)
    console.log(`   Mesh count: ${loadedModel.meshCount}`)
    console.log(`   Material count: ${loadedModel.materialCount}`)
    
    // Try to get bounding box
    const bboxRes = rl.getModelBoundingBox(loadedModel)
    if (bboxRes.isOk()) {
        const bbox = bboxRes.unwrap()
        console.log("   Bounding box:")
        console.log(`     Min: (${bbox.min.x.toFixed(2)}, ${bbox.min.y.toFixed(2)}, ${bbox.min.z.toFixed(2)})`)
        console.log(`     Max: (${bbox.max.x.toFixed(2)}, ${bbox.max.y.toFixed(2)}, ${bbox.max.z.toFixed(2)})`)
    } else {
        console.log("❌ Failed to get bounding box")
    }

    // Get loaded model count
    const countRes = rl.getLoadedModelCount()
    if (countRes.isOk()) {
        console.log(`   Total loaded models: ${countRes.unwrap()}`)
    }
} else {
    console.log("❌ Failed to load GLTF model")
    console.log("   Possible reasons:")
    console.log("   • GLTF format may not be supported by this Raylib build")
    console.log("   • File not found or corrupted")
    console.log("   • Model wrapper compilation issue")
}

let frameCount = 0

// Main game loop
while (true) {
    const shouldClose = rl.windowShouldClose()
    if (shouldClose.isErr() || shouldClose.unwrap()) break

    frameCount++

    // Begin drawing
    rl.beginDrawing()
    rl.clearBackground(Colors.RAYWHITE)

    // Begin 3D mode
    rl.beginMode3D(cameraPosition, cameraTarget, cameraUp, fovy, projection)

    if (loadedModel) {
        // Draw the loaded model
        rl.drawModel(loadedModel, new Vector3(0, 0, 0), 0.01, Colors.WHITE)
        
        // Also draw wireframe version offset to the side
        // rl.drawModelWires(loadedModel, new Vector3(10, 0, 0), 0.01, Colors.GREEN)
    } else {
        // Draw fallback 3D shapes
        rl.drawCube(new Vector3(0, 0, 0), 2, 2, 2, Colors.RED)
        rl.drawSphere(new Vector3(4, 0, 0), 1, Colors.BLUE)
        rl.drawCylinder(new Vector3(-4, 0, 0), 1, 1, 3, 8, Colors.GREEN)
    }

    rl.drawGrid(10, 1.0)

    // End 3D mode
    rl.endMode3D()

    // Draw UI
    rl.drawText("Model Loading Example", 10, 10, 20, Colors.DARKGRAY)
    if (loadedModel) {
        rl.drawText(`Model loaded! Meshes: ${loadedModel.meshCount}`, 10, 40, 16, Colors.GREEN)
        rl.drawText("Left: Model, Right: Wireframe", 10, 60, 14, Colors.DARKGRAY)
    } else {
        rl.drawText("No model loaded - showing 3D shapes", 10, 40, 16, Colors.DARKGRAY)
    }
    rl.drawText("Press ESC to exit", 10, 80, 14, Colors.GRAY)
    rl.drawFPS(10, 100)

    rl.endDrawing()

    // Exit after a few seconds for demo purposes
    if (frameCount > 300) break
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

console.log("Example completed successfully!")
rl.closeWindow()