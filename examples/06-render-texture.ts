// Example 6: Render texture handling
import { Raylib, Colors, Vector2, Rectangle, kb } from '../src/index'

const rl = new Raylib()

// Initialize window
const initResult = rl.initWindow(1000, 700, "Raylib - Render Texture")
if (initResult.isErr()) {
    console.error("Initialization error:", initResult.error)
    process.exit(1)
}

rl.setTargetFPS(60)

// Create render texture
let renderTextureSlot = -1
const rtResult = rl.loadRenderTexture(400, 300)
if (rtResult.isOk()) {
    renderTextureSlot = rtResult.value
    console.log(`Render texture created in slot: ${renderTextureSlot}`)
} else {
    console.error("Render texture creation error:", rtResult.unwrap())
}

// Animation variables
let time = 0
let shapes: Array<{pos: Vector2, color: number, size: number, type: 'circle' | 'rect'}> = []

// Create random shapes
for (let i = 0; i < 20; i++) {
    shapes.push({
        pos: new Vector2(Math.random() * 350 + 25, Math.random() * 250 + 25),
        color: [Colors.RED, Colors.GREEN, Colors.BLUE, Colors.YELLOW, Colors.PURPLE, Colors.ORANGE][Math.floor(Math.random() * 6)] || Colors.RED,
        size: Math.random() * 30 + 10,
        type: Math.random() > 0.5 ? 'circle' : 'rect'
    })
}

// Control variables
let clearRenderTexture = false
let showRenderTexture = true
let renderTextureScale = 1.0
let renderTextureRotation = 0

// Main game loop
while (true) {
    const shouldClose = rl.windowShouldClose().unwrap()
    if (shouldClose) break

    const deltaTime = rl.getFrameTime().unwrap()
    time += deltaTime
    
    // Controls
    if (rl.isKeyDown(kb.KEY_C).unwrap()) clearRenderTexture = true
    if (rl.isKeyDown(kb.KEY_T).unwrap()) showRenderTexture = !showRenderTexture
    if (rl.isKeyDown(kb.KEY_MINUS).unwrap() && renderTextureScale > 0.1) renderTextureScale -= 1.0 * deltaTime
    if (rl.isKeyDown(kb.KEY_EQUAL).unwrap() && renderTextureScale < 3.0) renderTextureScale += 1.0 * deltaTime
    if (rl.isKeyDown(kb.KEY_R).unwrap()) renderTextureRotation += 90 * deltaTime
    
    // Animate shapes
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i]
        if (!shape) continue
        shape.pos.x += Math.sin(time + i) * 50 * deltaTime
        shape.pos.y += Math.cos(time + i * 0.7) * 30 * deltaTime
        
        // Keep within render texture bounds
        if (shape.pos.x < 0) shape.pos.x = 400
        if (shape.pos.x > 400) shape.pos.x = 0
        if (shape.pos.y < 0) shape.pos.y = 300
        if (shape.pos.y > 300) shape.pos.y = 0
    }
    
    // Drawing to render texture
    if (renderTextureSlot >= 0) {
        // Begin drawing to render texture
        // Note: In real implementation, BeginTextureMode would be here
        // For demonstration, we'll draw directly to screen
        
        // Clear render texture if needed
        if (clearRenderTexture) {
            // In real implementation, render texture would be cleared here
            clearRenderTexture = false
        }
    }
    
    // Main drawing
    rl.beginDrawing()
    rl.clearBackground(Colors.RAYWHITE)
    
    // Title
    rl.drawText("Render Texture", 420, 20, 24, Colors.BLACK)
    
    // Instructions
    rl.drawText("Controls:", 20, 60, 16, Colors.BLACK)
    rl.drawText("C - clear render texture", 20, 85, 14, Colors.DARKGRAY)
    rl.drawText("T - show/hide render texture", 20, 105, 14, Colors.DARKGRAY)
    rl.drawText("-/+ - render texture scale", 20, 125, 14, Colors.DARKGRAY)
    rl.drawText("R - rotate render texture", 20, 145, 14, Colors.DARKGRAY)
    
    // Информация о render texture
    if (renderTextureSlot >= 0) {
        const rtResult = rl.getRenderTextureFromSlot(renderTextureSlot)
        if (rtResult.isOk()) {
            const rt = rtResult.value
            rl.drawText("Information about Render Texture:", 20, 180, 16, Colors.BLACK)
            rl.drawText(`ID: ${rt.id}`, 20, 205, 14, Colors.DARKGRAY)
            rl.drawText(`Sizw: ${rt.texture.width}x${rt.texture.height}`, 20, 225, 14, Colors.DARKGRAY)
            rl.drawText(`Color ID: ${rt.texture.id}`, 20, 245, 14, Colors.DARKGRAY)
            rl.drawText(`Depth ID: ${rt.depth.id}`, 20, 265, 14, Colors.DARKGRAY)
        }
        
        const countResult = rl.getLoadedRenderTextureCount()
        if (countResult.isOk()) {
            rl.drawText(`Loaded RT: ${countResult.value}`, 20, 290, 14, Colors.BLACK)
        }
    }
    
    // Рисование области render texture (симуляция)
    const rtArea = new Rectangle(500, 100, 400, 300)
    rl.drawRectangleRec(rtArea, Colors.BLACK)
    rl.drawRectangle(rtArea.x + 2, rtArea.y + 2, rtArea.width - 4, rtArea.height - 4, Colors.DARKGRAY)
    
    // Рисование фигур в области render texture
    for (const shape of shapes) {
        const worldPos = new Vector2(rtArea.x + shape.pos.x, rtArea.y + shape.pos.y)
        
        if (shape.type === 'circle') {
            rl.drawCircleV(worldPos, shape.size / 2, shape.color)
        } else {
            rl.drawRectangle(worldPos.x - shape.size/2, worldPos.y - shape.size/2, shape.size, shape.size, shape.color)
        }
    }
    
    rl.drawText("Render Texture Area", rtArea.x + 120, rtArea.y - 25, 16, Colors.BLACK)
    
    // Показ render texture в другом месте (симуляция)
    if (showRenderTexture) {
        const displayArea = new Rectangle(50, 400, 200 * renderTextureScale, 150 * renderTextureScale)
        
        // Рамка
        rl.drawRectangle(displayArea.x - 2, displayArea.y - 2, displayArea.width + 4, displayArea.height + 4, Colors.BLACK)
        rl.drawRectangleRec(displayArea, Colors.WHITE)
        
        // Уменьшенные фигуры
        for (const shape of shapes) {
            const scaledPos = new Vector2(
                displayArea.x + (shape.pos.x / 400) * displayArea.width,
                displayArea.y + (shape.pos.y / 300) * displayArea.height
            )
            const scaledSize = (shape.size / 2) * renderTextureScale
            
            if (shape.type === 'circle') {
                rl.drawCircleV(scaledPos, scaledSize, shape.color)
            } else {
                rl.drawRectangle(scaledPos.x - scaledSize, scaledPos.y - scaledSize, scaledSize * 2, scaledSize * 2, shape.color)
            }
        }
        
        rl.drawText("Show RT", displayArea.x + 20, displayArea.y + displayArea.height + 10, 14, Colors.BLACK)
        rl.drawText(`Size: ${renderTextureScale.toFixed(2)}`, displayArea.x + 20, displayArea.y + displayArea.height + 30, 12, Colors.DARKGRAY)
    }
    
    // Дополнительная информация
    rl.drawText("State:", 300, 400, 16, Colors.BLACK)
    rl.drawText(`Show RT: ${showRenderTexture ? 'Yes' : 'No'}`, 300, 425, 14, Colors.DARKGRAY)
    rl.drawText(`Scale: ${renderTextureScale.toFixed(2)}`, 300, 445, 14, Colors.DARKGRAY)
    rl.drawText(`Rotation: ${Math.floor(renderTextureRotation)}°`, 300, 465, 14, Colors.DARKGRAY)
    rl.drawText(`Figures: ${shapes.length}`, 300, 485, 14, Colors.DARKGRAY)
    
    // Объяснение концепции
    rl.drawText("Idea Render Texture:", 300, 520, 16, Colors.BLACK)
    rl.drawText("• Draw into a texure instead of a screen", 300, 545, 12, Colors.DARKGRAY)
    rl.drawText("• You can resuse result", 300, 560, 12, Colors.DARKGRAY)
    rl.drawText("• Posteffects", 300, 575, 12, Colors.DARKGRAY)
    rl.drawText("• Performance optimization", 300, 590, 12, Colors.DARKGRAY)
    
    rl.drawText("Press ESC to exit", 380, 650, 18, Colors.DARKGRAY)
    
    rl.drawFPS(10, 10)
    rl.endDrawing()
}

// Очистка ресурсов
if (renderTextureSlot >= 0) {
    rl.unloadRenderTextureFromSlot(renderTextureSlot)
}

rl.closeWindow()