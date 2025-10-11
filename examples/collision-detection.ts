import { Raylib, Vector2, Rectangle, Colors } from '../src/index'

function main() {
    const rl = new Raylib()

    // Initialize window
    const initResult = rl.initWindow(800, 600, 'Collision Detection Example')
    if (initResult.isErr()) {
        console.error('Failed to initialize window:', initResult.error.message)
        return
    }

    rl.setTargetFPS(60)

    // Game objects
    const player = new Rectangle(100, 100, 50, 50)
    const obstacle = new Rectangle(300, 200, 80, 60)
    const circle1Center = new Vector2(500, 150)
    const circle1Radius = 40
    const circle2Center = new Vector2(600, 300)
    const circle2Radius = 30

    // Triangle points
    const triangleP1 = new Vector2(200, 400)
    const triangleP2 = new Vector2(300, 400)
    const triangleP3 = new Vector2(250, 350)

    // Main game loop
    while (true) {
        const shouldCloseResult = rl.windowShouldClose()
        if (shouldCloseResult.isOk() && shouldCloseResult.value) {
            break
        }

        // Get mouse position
        const mousePos = rl.getMousePosition().unwrapOr(Vector2.Zero())

        // Update player position with mouse
        player.x = mousePos.x - player.width / 2
        player.y = mousePos.y - player.height / 2

        // Check collisions
        const playerObstacleCollision = rl.checkCollisionRecs(player, obstacle).unwrapOr(false)
        const circlesCollision = rl.checkCollisionCircles(circle1Center, circle1Radius, circle2Center, circle2Radius).unwrapOr(false)
        const playerCircleCollision = rl.checkCollisionCircleRec(circle1Center, circle1Radius, player).unwrapOr(false)
        const mouseInTriangle = rl.checkCollisionPointTriangle(mousePos, triangleP1, triangleP2, triangleP3).unwrapOr(false)
        const mouseInCircle = rl.checkCollisionPointCircle(mousePos, circle2Center, circle2Radius).unwrapOr(false)
        const mouseInRectangle = rl.checkCollisionPointRec(mousePos, obstacle).unwrapOr(false)

        rl.beginDrawing()
        rl.clearBackground(Colors.RAYWHITE)

        // Draw player (changes color on collision)
        const playerColor = playerObstacleCollision || playerCircleCollision ? Colors.RED : Colors.BLUE
        rl.drawRectangleRec(player, playerColor)

        // Draw obstacle (changes color when mouse is inside)
        const obstacleColor = mouseInRectangle ? Colors.ORANGE : Colors.GRAY
        rl.drawRectangleRec(obstacle, obstacleColor)

        // Draw circles (change color when colliding)
        const circle1Color = circlesCollision || playerCircleCollision ? Colors.RED : Colors.GREEN
        const circle2Color = circlesCollision || mouseInCircle ? Colors.RED : Colors.PURPLE
        rl.drawCircleV(circle1Center, circle1Radius, circle1Color)
        rl.drawCircleV(circle2Center, circle2Radius, circle2Color)

        // Draw triangle (changes color when mouse is inside)
        const triangleColor = mouseInTriangle ? Colors.YELLOW : Colors.GREEN
        rl.drawTriangle(triangleP1, triangleP2, triangleP3, triangleColor)

        // Draw collision status text
        rl.drawText("Move mouse to control blue rectangle", 10, 10, 20, Colors.BLACK)
        rl.drawText(`Player-Obstacle Collision: ${playerObstacleCollision}`, 10, 40, 16, Colors.BLACK)
        rl.drawText(`Player-Circle Collision: ${playerCircleCollision}`, 10, 60, 16, Colors.BLACK)
        rl.drawText(`Circles Collision: ${circlesCollision}`, 10, 80, 16, Colors.BLACK)
        rl.drawText(`Mouse in Triangle: ${mouseInTriangle}`, 10, 100, 16, Colors.BLACK)
        rl.drawText(`Mouse in Circle: ${mouseInCircle}`, 10, 120, 16, Colors.BLACK)
        rl.drawText(`Mouse in Rectangle: ${mouseInRectangle}`, 10, 140, 16, Colors.BLACK)

        // Draw mouse position
        rl.drawText(`Mouse: (${Math.round(mousePos.x)}, ${Math.round(mousePos.y)})`, 10, 170, 16, Colors.BLACK)

        // Draw labels
        rl.drawText("Player", player.x, player.y - 20, 12, Colors.BLACK)
        rl.drawText("Obstacle", obstacle.x, obstacle.y - 20, 12, Colors.BLACK)
        rl.drawText("Circle 1", circle1Center.x - 25, circle1Center.y - circle1Radius - 15, 12, Colors.BLACK)
        rl.drawText("Circle 2", circle2Center.x - 25, circle2Center.y - circle2Radius - 15, 12, Colors.BLACK)
        rl.drawText("Triangle", triangleP1.x, triangleP1.y + 20, 12, Colors.BLACK)

        rl.drawFPS(10, 550)
        rl.endDrawing()
    }

    rl.closeWindow()
}

main()