// Example 5: Texture loading and handling
import { Raylib, Colors, Vector2, kb } from '../src/index'

const rl = new Raylib()

// Initialize window
const initResult = rl.initWindow(1000, 700, "Raylib - Texture Handling")
if (initResult.isErr()) {
    console.error("Initialization error:", initResult.error)
    process.exit(1)
}

rl.setTargetFPS(60)

// Load texture
let textureSlot = -1
const loadResult = rl.loadTexture("./assets/textures/texture.jpg")
if (loadResult.isOk()) {
    textureSlot = loadResult.value
    console.log(`Texture loaded in slot: ${textureSlot}`)
} else {
    console.error("Texture loading error:", loadResult.error)
}

// Animation and control variables
let rotation = 0
let scale = 1.0
let position = new Vector2(400, 300)
let tint = Colors.WHITE
const speed = 200

// Main game loop
while (true) {
    const shouldClose = rl.windowShouldClose().unwrap()
    if (shouldClose) break

    const deltaTime = rl.getFrameTime().unwrap()
    
    // Position control
    if (rl.isKeyDown(kb.KEY_W).unwrap()) position.y -= speed * deltaTime
    if (rl.isKeyDown(kb.KEY_S).unwrap()) position.y += speed * deltaTime
    if (rl.isKeyDown(kb.KEY_A).unwrap()) position.x -= speed * deltaTime
    if (rl.isKeyDown(kb.KEY_D).unwrap()) position.x += speed * deltaTime
    
    // Rotation control
    if (rl.isKeyDown(kb.KEY_Q).unwrap()) rotation -= 90 * deltaTime
    if (rl.isKeyDown(kb.KEY_E).unwrap()) rotation += 90 * deltaTime
    
    // Scale control
    if (rl.isKeyDown(kb.KEY_Z).unwrap() && scale > 0.1) scale -= 1.0 * deltaTime
    if (rl.isKeyDown(kb.KEY_X).unwrap() && scale < 3.0) scale += 1.0 * deltaTime
    
    // Tint color change
    if (rl.isKeyDown(kb.KEY_ONE).unwrap()) tint = Colors.WHITE
    if (rl.isKeyDown(kb.KEY_TWO).unwrap()) tint = Colors.RED
    if (rl.isKeyDown(kb.KEY_THREE).unwrap()) tint = Colors.GREEN
    if (rl.isKeyDown(kb.KEY_FOUR).unwrap()) tint = Colors.BLUE
    if (rl.isKeyDown(kb.KEY_FIVE).unwrap()) tint = Colors.YELLOW
    if (rl.isKeyDown(kb.KEY_SIX).unwrap()) tint = Colors.PURPLE
    
    // Drawing
    rl.beginDrawing()
    rl.clearBackground(Colors.RAYWHITE)
    
    // Title
    rl.drawText("Texture Handling", 420, 20, 24, Colors.BLACK)
    
    // Instructions
    rl.drawText("Controls:", 20, 60, 16, Colors.BLACK)
    rl.drawText("WASD - move texture", 20, 85, 14, Colors.DARKGRAY)
    rl.drawText("Q/E - rotate", 20, 105, 14, Colors.DARKGRAY)
    rl.drawText("Z/X - scale", 20, 125, 14, Colors.DARKGRAY)
    rl.drawText("1-6 - color tints", 20, 145, 14, Colors.DARKGRAY)
    
    // Texture information
    if (textureSlot >= 0) {
        const textureResult = rl.getTextureFromSlot(textureSlot)
        if (textureResult.isOk()) {
            const texture = textureResult.value
            rl.drawText(`Texture Information:`, 20, 180, 16, Colors.BLACK)
            rl.drawText(`ID: ${texture.id}`, 20, 205, 14, Colors.DARKGRAY)
            rl.drawText(`Size: ${texture.width}x${texture.height}`, 20, 225, 14, Colors.DARKGRAY)
            rl.drawText(`Mipmaps: ${texture.mipmaps}`, 20, 245, 14, Colors.DARKGRAY)
            rl.drawText(`Format: ${texture.format}`, 20, 265, 14, Colors.DARKGRAY)
        }
        
        // State information
        rl.drawText(`Position: (${Math.floor(position.x)}, ${Math.floor(position.y)})`, 20, 300, 14, Colors.BLACK)
        rl.drawText(`Rotation: ${Math.floor(rotation)}°`, 20, 320, 14, Colors.BLACK)
        rl.drawText(`Scale: ${scale.toFixed(2)}`, 20, 340, 14, Colors.BLACK)
        
        // Loaded texture count
        const countResult = rl.getLoadedTextureCount()
        if (countResult.isOk()) {
            rl.drawText(`Loaded textures: ${countResult.value}`, 20, 370, 14, Colors.BLACK)
        }
    }
    
    // Draw texture
    if (textureSlot >= 0) {
        // Simple texture drawing
        rl.drawTextureFromSlot(textureSlot, 600, 100, Colors.WHITE)
        rl.drawText("Normal", 620, 200, 12, Colors.BLACK)
        
        // Draw with transformations
        const textureResult = rl.getTextureFromSlot(textureSlot)
        if (textureResult.isOk()) {
            const texture = textureResult.value
            const origin = new Vector2(texture.width / 2, texture.height / 2)
            rl.drawTextureProFromSlot(textureSlot, position.x, position.y, origin.x, origin.y, rotation, scale, tint)
        }
        
        // Multiple copies with different tints
        rl.drawTextureFromSlot(textureSlot, 750, 400, Colors.RED)
        rl.drawText("Red", 760, 500, 12, Colors.BLACK)
        
        rl.drawTextureFromSlot(textureSlot, 850, 400, Colors.GREEN)
        rl.drawText("Green", 860, 500, 12, Colors.BLACK)
        
        rl.drawTextureFromSlot(textureSlot, 750, 520, Colors.BLUE)
        rl.drawText("Blue", 760, 620, 12, Colors.BLACK)
        
        rl.drawTextureFromSlot(textureSlot, 850, 520, Colors.YELLOW)
        rl.drawText("Yellow", 860, 620, 12, Colors.BLACK)
    } else {
        rl.drawText("Texture not loaded!", 400, 300, 20, Colors.RED)
        rl.drawText("Make sure ./assets/textures/texture.jpg exists", 250, 330, 14, Colors.DARKGRAY)
    }
    
    // Color samples for tints
    rl.drawText("Tints (1-6):", 20, 420, 14, Colors.BLACK)
    rl.drawRectangle(20, 440, 30, 20, Colors.WHITE)
    rl.drawText("1", 32, 445, 12, Colors.BLACK)
    
    rl.drawRectangle(60, 440, 30, 20, Colors.RED)
    rl.drawText("2", 72, 445, 12, Colors.WHITE)
    
    rl.drawRectangle(100, 440, 30, 20, Colors.GREEN)
    rl.drawText("3", 112, 445, 12, Colors.WHITE)
    
    rl.drawRectangle(140, 440, 30, 20, Colors.BLUE)
    rl.drawText("4", 152, 445, 12, Colors.WHITE)
    
    rl.drawRectangle(180, 440, 30, 20, Colors.YELLOW)
    rl.drawText("5", 192, 445, 12, Colors.BLACK)
    
    rl.drawRectangle(220, 440, 30, 20, Colors.PURPLE)
    rl.drawText("6", 232, 445, 12, Colors.WHITE)
    
    rl.drawText("Press ESC to exit", 420, 650, 18, Colors.DARKGRAY)
    
    rl.drawFPS(10, 10)
    rl.endDrawing()
}

// Cleanup resources
if (textureSlot >= 0) {
    rl.unloadTextureFromSlot(textureSlot)
}

rl.closeWindow()