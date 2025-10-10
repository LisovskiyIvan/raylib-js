import { Colors } from "../src/constants";
import Raylib from "../src/Raylib";
import { collectResults } from "../src/utils";

function main() {
    const rl = new Raylib()
    
    const result = rl.initWindow(800, 450, 'Shapes Example')
        .andThen(() => rl.setTargetFPS(60))
        .andThen(() => {
            console.log('Drawing shapes with Result API...')
            
            while (true) {
                const shouldClose = rl.windowShouldClose().unwrapOr(true)
                if (shouldClose) {
                    rl.closeWindow()
                    break
                }

                // Draw multiple shapes using collectResults utility
                const drawOperations = [
                    () => rl.beginDrawing(),
                    () => rl.clearBackground(Colors.WHITE),
                    () => rl.drawText("Shapes Example", 280, 50, 20, Colors.BLACK),
                    
                    // Draw various shapes
                    () => rl.drawRectangle(100, 150, 120, 60, Colors.RED),
                    () => rl.drawRectangle(250, 150, 120, 60, Colors.GREEN),
                    () => rl.drawRectangle(400, 150, 120, 60, Colors.BLUE),
                    () => rl.drawRectangle(550, 150, 120, 60, Colors.YELLOW),
                    
                    // Draw labels
                    () => rl.drawText("Red", 140, 175, 16, Colors.WHITE),
                    () => rl.drawText("Green", 280, 175, 16, Colors.WHITE),
                    () => rl.drawText("Blue", 430, 175, 16, Colors.WHITE),
                    () => rl.drawText("Yellow", 575, 175, 16, Colors.BLACK),
                    
                    // Draw some smaller rectangles
                    () => rl.drawRectangle(150, 250, 80, 40, Colors.DARKGRAY),
                    () => rl.drawRectangle(300, 250, 80, 40, Colors.GRAY),
                    () => rl.drawRectangle(450, 250, 80, 40, Colors.RAYWHITE),
                    
                    () => rl.drawFPS(10, 10),
                    () => rl.endDrawing()
                ]

                // Execute all drawing operations and collect results
                const results = drawOperations.map(op => op())
                const frameResult = collectResults(results)
                
                frameResult.match(
                    () => {}, // All operations succeeded
                    (error) => {
                        console.error(`Drawing error: [${error.kind}] ${error.message}`)
                        return // Exit on error
                    }
                )
            }
            
            return rl.closeWindow()
        })

    result.match(
        () => console.log('Shapes example completed!'),
        (error) => {
            console.error(`Example failed: [${error.kind}] ${error.message}`)
            rl.closeWindow()
        }
    )
}

main()