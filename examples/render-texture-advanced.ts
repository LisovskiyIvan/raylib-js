import Raylib from '../src/Raylib'
import { Colors } from '../src/constants'
import Vector2 from '../src/math/Vector2'

const rl = new Raylib()

// Initialize window
const initResult = rl.initWindow(800, 600, "Advanced Render Texture Example")
if (initResult.isErr()) {
    console.error("Failed to initialize window:", initResult.error)
    process.exit(1)
}

rl.setTargetFPS(60)

// Load a render texture (framebuffer) - smaller than screen
const renderTextureSlotResult = rl.loadRenderTexture(200, 150)
if (renderTextureSlotResult.isErr()) {
    console.error("Failed to load render texture:", renderTextureSlotResult.error)
    rl.closeWindow()
    process.exit(1)
}

const renderTextureSlot = renderTextureSlotResult.unwrap()
const renderTexture = rl.getRenderTextureFromSlot(renderTextureSlot).unwrap()

console.log("Render texture created successfully!")
console.log(`- Size: ${renderTexture.texture.width}x${renderTexture.texture.height}`)
console.log(`- Color buffer ID: ${renderTexture.texture.id}`)
console.log(`- Depth buffer ID: ${renderTexture.depth.id}`)

let rotation = 0

// Main game loop
while (true) {
    const shouldClose = rl.windowShouldClose()
    if (shouldClose.isErr() || shouldClose.unwrap()) {
        break
    }

    rotation += 1

    // Begin drawing to screen
    rl.beginDrawing()
    rl.clearBackground(Colors.RAYWHITE)
    
    // Draw some content to demonstrate render texture usage
    rl.drawText("Render Texture Advanced Example", 10, 10, 20, Colors.DARKGRAY)
    rl.drawText("This demonstrates creating and using render textures", 10, 40, 16, Colors.DARKGRAY)
    
    // Draw render texture info
    rl.drawText(`Render Texture Info:`, 10, 80, 16, Colors.DARKGRAY)
    rl.drawText(`- Slot: ${renderTextureSlot}`, 10, 100, 14, Colors.GRAY)
    rl.drawText(`- Framebuffer ID: ${renderTexture.id}`, 10, 120, 14, Colors.GRAY)
    rl.drawText(`- Size: ${renderTexture.texture.width}x${renderTexture.texture.height}`, 10, 140, 14, Colors.GRAY)
    rl.drawText(`- Color Buffer ID: ${renderTexture.texture.id}`, 10, 160, 14, Colors.GRAY)
    rl.drawText(`- Depth Buffer ID: ${renderTexture.depth.id}`, 10, 180, 14, Colors.GRAY)
    
    // Draw some animated content
    const centerX = rl.width / 2
    const centerY = rl.height / 2 + 50
    const radius = 30 + Math.sin(rotation * 0.05) * 10
    
    rl.drawCircleV(new Vector2(centerX, centerY), radius, Colors.BLUE)
    rl.drawText("Animated Circle", centerX - 60, centerY + 50, 16, Colors.DARKGRAY)
    
    // Draw some rotating rectangles
    for (let i = 0; i < 3; i++) {
        const angle = rotation * 2 + i * 120
        const x = centerX + Math.cos(angle * Math.PI / 180) * 80
        const y = centerY + Math.sin(angle * Math.PI / 180) * 80
        rl.drawRectangle(x - 10, y - 10, 20, 20, i === 0 ? Colors.RED : i === 1 ? Colors.GREEN : Colors.PURPLE)
    }
    
    // Draw FPS
    rl.drawFPS(10, rl.height - 30)
    
    rl.endDrawing()
}

// Cleanup
console.log("Cleaning up render texture...")
rl.unloadRenderTextureFromSlot(renderTextureSlot)
rl.closeWindow()
console.log("Done!")