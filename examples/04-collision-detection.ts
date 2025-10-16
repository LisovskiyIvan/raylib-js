// Example 4: Collision detection for shapes
import { Raylib, Colors, Vector2, Rectangle, kb } from '../src/index'

const rl = new Raylib()

// Initialize window
const initResult = rl.initWindow(1000, 700, "Raylib - Collision Detection")
if (initResult.isErr()) {
    console.error("Initialization error:", initResult.error)
    process.exit(1)
}

rl.setTargetFPS(60)

// Game objects
let playerRect = new Rectangle(100, 100, 50, 50)
const staticRect = new Rectangle(300, 200, 80, 60)
const movingRect = new Rectangle(500, 150, 60, 40)

let playerCircle = new Vector2(150, 400)
const playerCircleRadius = 30
const staticCircle = new Vector2(400, 450)
const staticCircleRadius = 40
const movingCircle = new Vector2(600, 400)
const movingCircleRadius = 25

// Triangle for point collision testing
const triangle = {
    p1: new Vector2(750, 200),
    p2: new Vector2(720, 280),
    p3: new Vector2(780, 280)
}

// Animation variables
let time = 0
const speed = 100

// Main game loop
while (true) {
    const shouldClose = rl.windowShouldClose().unwrap()
    if (shouldClose) break

    const deltaTime = rl.getFrameTime().unwrap()
    time += deltaTime
    
    // Player control (rectangle)
    if (rl.isKeyDown(kb.KEY_W).unwrap()) playerRect.y -= speed * deltaTime
    if (rl.isKeyDown(kb.KEY_S).unwrap()) playerRect.y += speed * deltaTime
    if (rl.isKeyDown(kb.KEY_A).unwrap()) playerRect.x -= speed * deltaTime
    if (rl.isKeyDown(kb.KEY_D).unwrap()) playerRect.x += speed * deltaTime
    
    // Player control (circle)
    if (rl.isKeyDown(kb.KEY_UP).unwrap()) playerCircle.y -= speed * deltaTime
    if (rl.isKeyDown(kb.KEY_DOWN).unwrap()) playerCircle.y += speed * deltaTime
    if (rl.isKeyDown(kb.KEY_LEFT).unwrap()) playerCircle.x -= speed * deltaTime
    if (rl.isKeyDown(kb.KEY_RIGHT).unwrap()) playerCircle.x += speed * deltaTime
    
    // Animate moving objects
    movingRect.x = 500 + Math.sin(time * 2) * 100
    movingRect.y = 150 + Math.cos(time * 1.5) * 50
    
    movingCircle.x = 600 + Math.cos(time * 1.8) * 80
    movingCircle.y = 400 + Math.sin(time * 1.2) * 60
    
    // Get mouse position
    const mousePos = rl.getMousePosition().unwrap()
    
    // Check collisions
    const rectCollision = rl.checkCollisionRecs(playerRect, staticRect).unwrap()
    const rectMovingCollision = rl.checkCollisionRecs(playerRect, movingRect).unwrap()
    
    const circleCollision = rl.checkCollisionCircles(playerCircle, playerCircleRadius, staticCircle, staticCircleRadius).unwrap()
    const circleMovingCollision = rl.checkCollisionCircles(playerCircle, playerCircleRadius, movingCircle, movingCircleRadius).unwrap()
    
    const circleRectCollision = rl.checkCollisionCircleRec(playerCircle, playerCircleRadius, playerRect).unwrap()
    
    const mouseRectCollision = rl.checkCollisionPointRec(mousePos, staticRect).unwrap()
    const mouseCircleCollision = rl.checkCollisionPointCircle(mousePos, staticCircle, staticCircleRadius).unwrap()
    const mouseTriangleCollision = rl.checkCollisionPointTriangle(mousePos, triangle.p1, triangle.p2, triangle.p3).unwrap()
    
    // Drawing
    rl.beginDrawing()
    rl.clearBackground(Colors.RAYWHITE)
    
    // Title
    rl.drawText("Collision Detection", 400, 20, 24, Colors.BLACK)
    
    // Instructions
    rl.drawText("WASD - control rectangle", 20, 60, 14, Colors.DARKGRAY)
    rl.drawText("Arrows - control circle", 20, 80, 14, Colors.DARKGRAY)
    rl.drawText("Mouse - point collision testing", 20, 100, 14, Colors.DARKGRAY)
    
    // Draw rectangles
    const playerRectColor = (rectCollision || rectMovingCollision) ? Colors.RED : Colors.BLUE
    rl.drawRectangleRec(playerRect, playerRectColor)
    
    const staticRectColor = (rectCollision || mouseRectCollision) ? Colors.RED : Colors.GREEN
    rl.drawRectangleRec(staticRect, staticRectColor)
    
    const movingRectColor = rectMovingCollision ? Colors.RED : Colors.YELLOW
    rl.drawRectangleRec(movingRect, movingRectColor)
    
    // Draw circles
    const playerCircleColor = (circleCollision || circleMovingCollision || circleRectCollision) ? Colors.RED : Colors.BLUE
    rl.drawCircleV(playerCircle, playerCircleRadius, playerCircleColor)
    
    const staticCircleColor = (circleCollision || mouseCircleCollision) ? Colors.RED : Colors.GREEN
    rl.drawCircleV(staticCircle, staticCircleRadius, staticCircleColor)
    
    const movingCircleColor = circleMovingCollision ? Colors.RED : Colors.ORANGE
    rl.drawCircleV(movingCircle, movingCircleRadius, movingCircleColor)
    
    // Draw triangle
    const triangleColor = mouseTriangleCollision ? Colors.RED : Colors.PURPLE
    rl.drawTriangle(triangle.p1, triangle.p2, triangle.p3, triangleColor)
    
    // Draw mouse cursor
    rl.drawCircleV(mousePos, 3, Colors.BLACK)
    
    // Collision information
    let yOffset = 140
    rl.drawText("Collision Status:", 20, yOffset, 16, Colors.BLACK)
    yOffset += 25
    
    rl.drawText(`Rectangle-Rectangle: ${rectCollision ? 'Yes' : 'No'}`, 20, yOffset, 14, rectCollision ? Colors.RED : Colors.GREEN)
    yOffset += 20
    
    rl.drawText(`Rectangle-Moving: ${rectMovingCollision ? 'Yes' : 'No'}`, 20, yOffset, 14, rectMovingCollision ? Colors.RED : Colors.GREEN)
    yOffset += 20
    
    rl.drawText(`Circle-Circle: ${circleCollision ? 'Yes' : 'No'}`, 20, yOffset, 14, circleCollision ? Colors.RED : Colors.GREEN)
    yOffset += 20
    
    rl.drawText(`Circle-Moving Circle: ${circleMovingCollision ? 'Yes' : 'No'}`, 20, yOffset, 14, circleMovingCollision ? Colors.RED : Colors.GREEN)
    yOffset += 20
    
    rl.drawText(`Circle-Rectangle: ${circleRectCollision ? 'Yes' : 'No'}`, 20, yOffset, 14, circleRectCollision ? Colors.RED : Colors.GREEN)
    yOffset += 20
    
    rl.drawText(`Mouse-Rectangle: ${mouseRectCollision ? 'Yes' : 'No'}`, 20, yOffset, 14, mouseRectCollision ? Colors.RED : Colors.GREEN)
    yOffset += 20
    
    rl.drawText(`Mouse-Circle: ${mouseCircleCollision ? 'Yes' : 'No'}`, 20, yOffset, 14, mouseCircleCollision ? Colors.RED : Colors.GREEN)
    yOffset += 20
    
    rl.drawText(`Mouse-Triangle: ${mouseTriangleCollision ? 'Yes' : 'No'}`, 20, yOffset, 14, mouseTriangleCollision ? Colors.RED : Colors.GREEN)
    
    // Object labels
    rl.drawText("Player", playerRect.x, playerRect.y - 20, 12, Colors.BLACK)
    rl.drawText("Static", staticRect.x, staticRect.y - 20, 12, Colors.BLACK)
    rl.drawText("Moving", movingRect.x, movingRect.y - 20, 12, Colors.BLACK)
    
    rl.drawText("Player", playerCircle.x - 20, playerCircle.y - 50, 12, Colors.BLACK)
    rl.drawText("Static", staticCircle.x - 30, staticCircle.y - 60, 12, Colors.BLACK)
    rl.drawText("Moving", movingCircle.x - 30, movingCircle.y - 45, 12, Colors.BLACK)
    
    rl.drawText("Triangle", triangle.p1.x - 30, triangle.p1.y - 20, 12, Colors.BLACK)
    
    rl.drawText("Press ESC to exit", 400, 650, 18, Colors.DARKGRAY)
    
    rl.drawFPS(10, 10)
    rl.endDrawing()
}

rl.closeWindow()