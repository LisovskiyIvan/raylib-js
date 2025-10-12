import Raylib from '../src/Raylib'
import { Colors } from '../src/constants'

const rl = new Raylib()

// Initialize window
const initResult = rl.initWindow(800, 600, "Render Texture Example")
if (initResult.isErr()) {
    console.error("Failed to initialize window:", initResult.error)
    process.exit(1)
}

rl.setTargetFPS(60)

// Load a render texture (framebuffer)
const renderTextureSlotResult = rl.loadRenderTexture(400, 300)
if (renderTextureSlotResult.isErr()) {
    console.error("Failed to load render texture:", renderTextureSlotResult.error)
    rl.closeWindow()
    process.exit(1)
}

const renderTextureSlot = renderTextureSlotResult.unwrap()
console.log(`Render texture loaded to slot: ${renderTextureSlot}`)

// Get render texture details
const renderTextureResult = rl.getRenderTextureFromSlot(renderTextureSlot)
if (renderTextureResult.isErr()) {
    console.error("Failed to get render texture:", renderTextureResult.error)
    rl.closeWindow()
    process.exit(1)
}

const renderTexture = renderTextureResult.unwrap()
console.log("Render texture details:")
console.log(`- Framebuffer ID: ${renderTexture.id}`)
console.log(`- Color texture: ${renderTexture.texture.width}x${renderTexture.texture.height} (ID: ${renderTexture.texture.id})`)
console.log(`- Depth texture: ${renderTexture.depth.width}x${renderTexture.depth.height} (ID: ${renderTexture.depth.id})`)

// Main game loop
while (true) {
    const shouldClose = rl.windowShouldClose()
    if (shouldClose.isErr() || shouldClose.unwrap()) {
        break
    }

    // Begin drawing
    rl.beginDrawing()
    rl.clearBackground(Colors.RAYWHITE)
    
    // Draw some info text
    rl.drawText("Render Texture Example", 10, 10, 20, Colors.DARKGRAY)
    rl.drawText(`Render Texture Slot: ${renderTextureSlot}`, 10, 40, 16, Colors.DARKGRAY)
    rl.drawText(`Framebuffer ID: ${renderTexture.id}`, 10, 60, 16, Colors.DARKGRAY)
    rl.drawText(`Color Buffer: ${renderTexture.texture.width}x${renderTexture.texture.height}`, 10, 80, 16, Colors.DARKGRAY)
    rl.drawText(`Depth Buffer: ${renderTexture.depth.width}x${renderTexture.depth.height}`, 10, 100, 16, Colors.DARKGRAY)
    
    // Draw FPS
    rl.drawFPS(10, rl.height - 30)
    
    rl.endDrawing()
}

// Cleanup
rl.unloadRenderTextureFromSlot(renderTextureSlot)
rl.closeWindow()