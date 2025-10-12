// Example 3: Keyboard and mouse input handling
import { Raylib, Colors, Vector2, Rectangle, kb, mouse } from '../src/index'

const rl = new Raylib()

// Initialize window
const initResult = rl.initWindow(800, 600, "Raylib - Input Handling")
if (initResult.isErr()) {
    console.error("Initialization error:", initResult.error)
    process.exit(1)
}

rl.setTargetFPS(60)

// Player state
let playerPos = new Vector2(400, 300)
const playerSize = 50
const playerSpeed = 200

// State for tracking input
let lastKeyPressed = 0
let mouseClicked = false
let mousePos = new Vector2(0, 0)

// Main game loop
while (true) {
    const shouldClose = rl.windowShouldClose().unwrap()
    if (shouldClose) break

    // Get frame time for smooth movement
    const deltaTime = rl.getFrameTime().unwrap()
    
    // Keyboard handling - player movement
    if (rl.isKeyDown(kb.KEY_W).unwrap() || rl.isKeyDown(kb.KEY_UP).unwrap()) {
        playerPos.y -= playerSpeed * deltaTime
    }
    if (rl.isKeyDown(kb.KEY_S).unwrap() || rl.isKeyDown(kb.KEY_DOWN).unwrap()) {
        playerPos.y += playerSpeed * deltaTime
    }
    if (rl.isKeyDown(kb.KEY_A).unwrap() || rl.isKeyDown(kb.KEY_LEFT).unwrap()) {
        playerPos.x -= playerSpeed * deltaTime
    }
    if (rl.isKeyDown(kb.KEY_D).unwrap() || rl.isKeyDown(kb.KEY_RIGHT).unwrap()) {
        playerPos.x += playerSpeed * deltaTime
    }
    
    // Keep player within screen bounds
    if (playerPos.x < 0) playerPos.x = 0
    if (playerPos.x > 800 - playerSize) playerPos.x = 800 - playerSize
    if (playerPos.y < 0) playerPos.y = 0
    if (playerPos.y > 600 - playerSize) playerPos.y = 600 - playerSize
    
    // Get pressed key
    const keyPressed = rl.getKeyPressed().unwrap()
    if (keyPressed !== 0) {
        lastKeyPressed = keyPressed
    }
    
    // Mouse handling
    mousePos = rl.getMousePosition().unwrap()
    mouseClicked = rl.isMouseButtonDown(mouse.MOUSE_BUTTON_LEFT).unwrap()
    
    // Drawing
    rl.beginDrawing()
    rl.clearBackground(Colors.RAYWHITE)
    
    // Title
    rl.drawText("Input Control", 320, 20, 24, Colors.BLACK)
    
    // Instructions
    rl.drawText("WASD or arrows - movement", 20, 60, 16, Colors.DARKGRAY)
    rl.drawText("Mouse - hover and clicks", 20, 80, 16, Colors.DARKGRAY)
    rl.drawText("Any key - display key code", 20, 100, 16, Colors.DARKGRAY)
    
    // Draw player
    const playerColor = mouseClicked ? Colors.RED : Colors.BLUE
    rl.drawRectangle(playerPos.x, playerPos.y, playerSize, playerSize, playerColor)
    
    // Player position info
    rl.drawText(`Player position: (${Math.floor(playerPos.x)}, ${Math.floor(playerPos.y)})`, 20, 140, 16, Colors.BLACK)
    
    // Mouse info
    rl.drawText(`Mouse position: (${Math.floor(mousePos.x)}, ${Math.floor(mousePos.y)})`, 20, 160, 16, Colors.BLACK)
    rl.drawText(`Left mouse button: ${mouseClicked ? 'Pressed' : 'Released'}`, 20, 180, 16, Colors.BLACK)
    
    // Draw mouse cursor
    rl.drawCircleV(mousePos, 5, Colors.RED)
    
    // Line from player to mouse
    const playerCenter = new Vector2(playerPos.x + playerSize/2, playerPos.y + playerSize/2)
    rl.drawLineV(playerCenter, mousePos, Colors.GREEN)
    
    // Last pressed key info
    if (lastKeyPressed !== 0) {
        rl.drawText(`Last key: ${lastKeyPressed} (${String.fromCharCode(lastKeyPressed)})`, 20, 220, 16, Colors.BLACK)
    }
    
    // WASD key states
    const wPressed = rl.isKeyDown(kb.KEY_W).unwrap()
    const aPressed = rl.isKeyDown(kb.KEY_A).unwrap()
    const sPressed = rl.isKeyDown(kb.KEY_S).unwrap()
    const dPressed = rl.isKeyDown(kb.KEY_D).unwrap()
    
    rl.drawText("WASD State:", 20, 260, 16, Colors.BLACK)
    rl.drawText(`W: ${wPressed ? 'Pressed' : 'Released'}`, 20, 280, 14, wPressed ? Colors.GREEN : Colors.GRAY)
    rl.drawText(`A: ${aPressed ? 'Pressed' : 'Released'}`, 20, 300, 14, aPressed ? Colors.GREEN : Colors.GRAY)
    rl.drawText(`S: ${sPressed ? 'Pressed' : 'Released'}`, 20, 320, 14, sPressed ? Colors.GREEN : Colors.GRAY)
    rl.drawText(`D: ${dPressed ? 'Pressed' : 'Released'}`, 20, 340, 14, dPressed ? Colors.GREEN : Colors.GRAY)
    
    // Additional info
    rl.drawText("Player changes color on mouse click", 20, 380, 14, Colors.DARKGRAY)
    rl.drawText("Green line connects player to cursor", 20, 400, 14, Colors.DARKGRAY)
    
    rl.drawText("Press ESC to exit", 300, 550, 18, Colors.DARKGRAY)
    
    rl.drawFPS(10, 10)
    rl.endDrawing()
}

rl.closeWindow()