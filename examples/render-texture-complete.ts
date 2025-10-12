import Raylib from '../src/Raylib'
import { Colors } from '../src/constants'
import Vector2 from '../src/math/Vector2'
import Rectangle from '../src/math/Rectangle'

const rl = new Raylib()

// Initialize window
const initResult = rl.initWindow(800, 600, "Complete Render Texture Example")
if (initResult.isErr()) {
    console.error("Failed to initialize window:", initResult.error)
    process.exit(1)
}

rl.setTargetFPS(60)

// Create multiple render textures for different purposes
const mainRenderTexture = rl.loadRenderTexture(400, 300).unwrap()
const smallRenderTexture = rl.loadRenderTexture(200, 150).unwrap()

console.log("Created render textures:")
console.log(`- Main render texture slot: ${mainRenderTexture}`)
console.log(`- Small render texture slot: ${smallRenderTexture}`)

// Get render texture details
const mainRT = rl.getRenderTextureFromSlot(mainRenderTexture).unwrap()
const smallRT = rl.getRenderTextureFromSlot(smallRenderTexture).unwrap()

console.log(`Main RT: ${mainRT.texture.width}x${mainRT.texture.height} (FB ID: ${mainRT.id})`)
console.log(`Small RT: ${smallRT.texture.width}x${smallRT.texture.height} (FB ID: ${smallRT.id})`)

let frame = 0

// Main game loop
while (true) {
    const shouldClose = rl.windowShouldClose()
    if (shouldClose.isErr() || shouldClose.unwrap()) {
        break
    }

    frame++

    // Begin drawing to screen
    rl.beginDrawing()
    rl.clearBackground(Colors.RAYWHITE)
    
    // Draw UI and information
    rl.drawText("Complete Render Texture Example", 10, 10, 20, Colors.DARKGRAY)
    rl.drawText("This example demonstrates:", 10, 40, 16, Colors.DARKGRAY)
    rl.drawText("• Creating multiple render textures", 20, 65, 14, Colors.GRAY)
    rl.drawText("• Managing render texture slots", 20, 85, 14, Colors.GRAY)
    rl.drawText("• Getting render texture properties", 20, 105, 14, Colors.GRAY)
    rl.drawText("• Proper cleanup", 20, 125, 14, Colors.GRAY)
    
    // Display render texture information
    rl.drawText("Render Texture Information:", 10, 160, 16, Colors.DARKGRAY)
    
    // Main render texture info
    rl.drawText(`Main RT (Slot ${mainRenderTexture}):`, 20, 185, 14, Colors.BLUE)
    rl.drawText(`  Size: ${mainRT.texture.width}x${mainRT.texture.height}`, 30, 205, 12, Colors.GRAY)
    rl.drawText(`  Framebuffer ID: ${mainRT.id}`, 30, 220, 12, Colors.GRAY)
    rl.drawText(`  Color Buffer ID: ${mainRT.texture.id}`, 30, 235, 12, Colors.GRAY)
    rl.drawText(`  Depth Buffer ID: ${mainRT.depth.id}`, 30, 250, 12, Colors.GRAY)
    
    // Small render texture info
    rl.drawText(`Small RT (Slot ${smallRenderTexture}):`, 20, 275, 14, Colors.GREEN)
    rl.drawText(`  Size: ${smallRT.texture.width}x${smallRT.texture.height}`, 30, 295, 12, Colors.GRAY)
    rl.drawText(`  Framebuffer ID: ${smallRT.id}`, 30, 310, 12, Colors.GRAY)
    rl.drawText(`  Color Buffer ID: ${smallRT.texture.id}`, 30, 325, 12, Colors.GRAY)
    rl.drawText(`  Depth Buffer ID: ${smallRT.depth.id}`, 30, 340, 12, Colors.GRAY)
    
    // Show loaded render texture count
    const rtCount = rl.getLoadedRenderTextureCount().unwrap()
    rl.drawText(`Total loaded render textures: ${rtCount}`, 20, 370, 14, Colors.PURPLE)
    
    // Draw some animated content to show the system is working
    const centerX = 600
    const centerY = 200
    const time = frame * 0.02
    
    // Animated circle
    const radius = 20 + Math.sin(time * 2) * 10
    rl.drawCircleV(new Vector2(centerX, centerY), radius, Colors.RED)
    
    // Rotating rectangles
    for (let i = 0; i < 4; i++) {
        const angle = time + i * Math.PI / 2
        const x = centerX + Math.cos(angle) * 50
        const y = centerY + Math.sin(angle) * 50
        const rect = new Rectangle(x - 8, y - 8, 16, 16)
        rl.drawRectangleRec(rect, Colors.BLUE)
    }
    
    rl.drawText("Animation", centerX - 30, centerY + 80, 14, Colors.DARKGRAY)
    
    // Draw FPS
    rl.drawFPS(10, rl.height - 30)
    
    rl.endDrawing()
}

// Cleanup - demonstrate proper resource management
console.log("Cleaning up render textures...")
console.log(`Render textures before cleanup: ${rl.getLoadedRenderTextureCount().unwrap()}`)

rl.unloadRenderTextureFromSlot(mainRenderTexture)
console.log(`After unloading main RT: ${rl.getLoadedRenderTextureCount().unwrap()}`)

rl.unloadRenderTextureFromSlot(smallRenderTexture)
console.log(`After unloading small RT: ${rl.getLoadedRenderTextureCount().unwrap()}`)

rl.closeWindow()
console.log("Example completed successfully!")