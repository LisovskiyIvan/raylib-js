import { Colors } from "../src/constants";
import Vector2 from "../src/math/Vector2";
import Raylib from "../src/Raylib";

function main() {
    // Можно использовать путь по умолчанию
    const rl = new Raylib()
    
    // Или передать свой путь к библиотеке
    // const rl = new Raylib('./path/to/your/raylib/library')
    
    const result = rl.initWindow(800, 450, 'Mouse Input Example')
        .andThen(() => rl.setTargetFPS(60))
        .andThen(() => {
            console.log('Mouse input example started. Move your mouse around!')
            
            while (true) {
                const shouldClose = rl.windowShouldClose().unwrapOr(true)
                if (shouldClose) {
                    rl.closeWindow()
                }

                // Get mouse data with Result API
                const mousePos = rl.getMousePosition().unwrapOr(Vector2.Zero())
                const mouseDelta = rl.getMouseDelta().unwrapOr(Vector2.Zero())
                
                // Draw frame
                rl.beginDrawing()
                    .andThen(() => rl.clearBackground(Colors.RAYWHITE))
                    .andThen(() => rl.drawText("Mouse Input Example", 250, 50, 20, Colors.BLACK))
                    .andThen(() => rl.drawText("Move your mouse around the screen", 220, 80, 16, Colors.GRAY))
                    
                    // Draw mouse position info
                    .andThen(() => rl.drawText(`Mouse Position: (${mousePos.x.toFixed(0)}, ${mousePos.y.toFixed(0)})`, 50, 150, 16, Colors.DARKGRAY))
                    .andThen(() => rl.drawText(`Mouse Delta: (${mouseDelta.x.toFixed(2)}, ${mouseDelta.y.toFixed(2)})`, 50, 180, 16, Colors.DARKGRAY))
                    
                    // Draw a circle that follows the mouse
                    .andThen(() => rl.drawRectangle(mousePos.x - 10, mousePos.y - 10, 20, 20, Colors.RED))
                    
                    // Draw movement trail effect
                    .andThen(() => {
                        const trailColor = Math.abs(mouseDelta.x) > 5 || Math.abs(mouseDelta.y) > 5 
                            ? Colors.GREEN 
                            : Colors.BLUE
                        return rl.drawRectangle(mousePos.x - 5, mousePos.y - 5, 10, 10, trailColor)
                    })
                    
                    // Draw speed indicator
                    .andThen(() => {
                        const speed = Math.sqrt(mouseDelta.x * mouseDelta.x + mouseDelta.y * mouseDelta.y)
                        const speedText = `Speed: ${speed.toFixed(2)} px/frame`
                        return rl.drawText(speedText, 50, 210, 16, Colors.DARKGRAY)
                    })
                    
                    // Draw instructions
                    .andThen(() => rl.drawText("Red square follows mouse", 50, 350, 14, Colors.RED))
                    .andThen(() => rl.drawText("Green/Blue square shows movement", 50, 370, 14, Colors.GREEN))
                    .andThen(() => rl.drawText("Press ESC to exit", 50, 400, 14, Colors.GRAY))
                    
                    .andThen(() => rl.drawFPS(10, 10))
                    .andThen(() => rl.endDrawing())
                    .match(
                        () => {}, // Success
                        (error) => {
                            console.error(`Frame error: [${error.kind}] ${error.message}`)
                            return // Exit on error
                        }
                    )
            }
            
            return rl.closeWindow()
        })

    result.match(
        () => console.log('Mouse input example completed!'),
        (error) => {
            console.error(`Example failed: [${error.kind}] ${error.message}`)
            rl.closeWindow()
        }
    )
}

main()