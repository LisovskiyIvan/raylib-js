import { Raylib, Vector2, Rectangle, Colors } from '../src/index'

function main() {
    const rl = new Raylib()

    // Initialize window
    const initResult = rl.initWindow(800, 450, 'Triangle and Rectangle Pro Example')
    if (initResult.isErr()) {
        console.error('Failed to initialize window:', initResult.error.message)
        return
    }

    rl.setTargetFPS(60)

    let rotation = 0

    // Main game loop
    while (true) {
        const shouldCloseResult = rl.windowShouldClose()
        if (shouldCloseResult.isOk() && shouldCloseResult.value) {
            break
        }

        // Update rotation
        rotation += 1

        rl.beginDrawing()
        rl.clearBackground(Colors.RAYWHITE)

        // Draw triangles
        const triangle1V1 = new Vector2(100, 100)
        const triangle1V2 = new Vector2(200, 100)
        const triangle1V3 = new Vector2(150, 50)
        rl.drawTriangle(triangle1V1, triangle1V2, triangle1V3, Colors.RED)

        const triangle2V1 = new Vector2(300, 150)
        const triangle2V2 = new Vector2(400, 150)
        const triangle2V3 = new Vector2(350, 100)
        rl.drawTriangle(triangle2V1, triangle2V2, triangle2V3, Colors.GREEN)

        // Draw rotating rectangles with DrawRectanglePro
        const rect1 = new Rectangle(100, 200, 80, 60)
        const origin1 = new Vector2(40, 30) // Center of rectangle
        rl.drawRectanglePro(rect1, origin1, rotation, Colors.BLUE)

        const rect2 = new Rectangle(300, 200, 100, 40)
        const origin2 = new Vector2(50, 20) // Center of rectangle
        rl.drawRectanglePro(rect2, origin2, -rotation * 0.5, Colors.PURPLE)

        // Draw a rectangle that rotates around a different point
        const rect3 = new Rectangle(500, 150, 60, 80)
        const origin3 = new Vector2(0, 0) // Top-left corner
        rl.drawRectanglePro(rect3, origin3, rotation * 2, Colors.ORANGE)

        // Draw labels
        rl.drawText("DrawTriangle Examples", 10, 10, 20, Colors.BLACK)
        rl.drawText("DrawRectanglePro Examples (rotating)", 10, 350, 20, Colors.BLACK)
        rl.drawText("Red Triangle", 80, 120, 12, Colors.BLACK)
        rl.drawText("Green Triangle", 320, 170, 12, Colors.BLACK)
        rl.drawText("Blue Rect (center origin)", 60, 280, 10, Colors.BLACK)
        rl.drawText("Purple Rect (center origin)", 250, 260, 10, Colors.BLACK)
        rl.drawText("Orange Rect (corner origin)", 450, 250, 10, Colors.BLACK)

        rl.drawFPS(10, 40)
        rl.endDrawing()
    }

    rl.closeWindow()
}

main()