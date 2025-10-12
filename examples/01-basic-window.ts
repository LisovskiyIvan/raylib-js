// Example 1: Basic Window
import { Raylib, Colors } from '../src/index'

const rl = new Raylib()

// Initialize window
const initResult = rl.initWindow(800, 600, "Raylib - Basic Window")
if (initResult.isErr()) {
    console.error("Initialization error:", initResult.error)
    process.exit(1)
}

// Set target FPS
rl.setTargetFPS(60)

// Main game loop
while (true) {
    const shouldClose = rl.windowShouldClose().unwrap()
    if (shouldClose) break

    // Begin drawing
    rl.beginDrawing()
    
    // Clear background
    rl.clearBackground(Colors.RAYWHITE)
    
    // Draw text
    rl.drawText("Welcome to Raylib!", 250, 200, 20, Colors.DARKGRAY)
    rl.drawText("Press ESC to exit", 280, 250, 20, Colors.GRAY)
    
    // Show FPS
    rl.drawFPS(10, 10)
    
    // End drawing
    rl.endDrawing()
}

// Close window
rl.closeWindow()