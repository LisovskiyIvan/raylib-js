// Example 2: All available shapes and text
import { Raylib, Colors, Vector2, Rectangle } from '../src/index'

const rl = new Raylib()

// Initialize window
const initResult = rl.initWindow(1000, 700, "Raylib - Shapes and Text")
if (initResult.isErr()) {
    console.error("Initialization error:", initResult.error)
    process.exit(1)
}

rl.setTargetFPS(60)

// Main game loop
while (true) {
    const shouldClose = rl.windowShouldClose().unwrap()
    if (shouldClose) break

    rl.beginDrawing()
    rl.clearBackground(Colors.RAYWHITE)
    
    // Title
    rl.drawText("Shapes and Text Examples", 350, 20, 24, Colors.BLACK)
    
    // Pixels
    rl.drawPixel(50, 80, Colors.RED)
    rl.drawPixelV(new Vector2(60, 80), Colors.GREEN)
    rl.drawText("Pixels", 20, 100, 16, Colors.DARKGRAY)
    
    // Lines
    rl.drawLine(150, 80, 250, 120, Colors.BLUE)
    rl.drawLineV(new Vector2(150, 130), new Vector2(250, 90), Colors.PURPLE)
    rl.drawText("Lines", 180, 140, 16, Colors.DARKGRAY)
    
    // Rectangles
    rl.drawRectangle(300, 80, 100, 60, Colors.RED)
    rl.drawRectangleRec(new Rectangle(420, 80, 100, 60), Colors.GREEN)
    
    // Rotated rectangle
    const rotRect = new Rectangle(550, 80, 80, 40)
    const origin = new Vector2(40, 20) // rectangle center
    rl.drawRectanglePro(rotRect, origin, 45, Colors.ORANGE)
    rl.drawText("Rectangles", 400, 160, 16, Colors.DARKGRAY)
    
    // Circles
    rl.drawCircle(100, 250, 40, Colors.BLUE)
    rl.drawCircleV(new Vector2(200, 250), 35, Colors.YELLOW)
    rl.drawText("Circles", 120, 310, 16, Colors.DARKGRAY)
    
    // Triangles
    const v1 = new Vector2(350, 220)
    const v2 = new Vector2(320, 280)
    const v3 = new Vector2(380, 280)
    rl.drawTriangle(v1, v2, v3, Colors.PURPLE)
    
    const v4 = new Vector2(450, 220)
    const v5 = new Vector2(420, 280)
    const v6 = new Vector2(480, 280)
    rl.drawTriangle(v4, v5, v6, Colors.GREEN)
    rl.drawText("Triangles", 370, 310, 16, Colors.DARKGRAY)
    
    // Different text sizes
    rl.drawText("Small text", 50, 400, 12, Colors.GRAY)
    rl.drawText("Medium text", 50, 430, 18, Colors.DARKGRAY)
    rl.drawText("Large text", 50, 470, 24, Colors.BLACK)
    rl.drawText("Huge text", 50, 510, 32, Colors.RED)
    
    // Colored text
    rl.drawText("Red", 400, 400, 20, Colors.RED)
    rl.drawText("Green", 400, 430, 20, Colors.GREEN)
    rl.drawText("Blue", 400, 460, 20, Colors.BLUE)
    rl.drawText("Yellow", 400, 490, 20, Colors.YELLOW)
    rl.drawText("Purple", 400, 520, 20, Colors.PURPLE)
    
    // Instructions
    rl.drawText("Press ESC to exit", 380, 650, 18, Colors.DARKGRAY)
    
    rl.drawFPS(10, 10)
    rl.endDrawing()
}

rl.closeWindow()