import { Colors } from "../src/constants";
import Raylib from "../src/Raylib";

function main() {
    // Можно использовать путь по умолчанию
    const rl = new Raylib()
    
    // Или передать свой путь к библиотеке
    // const rl = new Raylib('./path/to/your/raylib/library')
    
    // Simple initialization with error handling
    const result = rl.initWindow(800, 450, 'Basic Raylib Example')
        .andThen(() => rl.setTargetFPS(60))
        .andThen(() => {
            console.log('Raylib initialized successfully!')
            
            // Simple game loop
            while (true) {
                const shouldClose = rl.windowShouldClose().unwrapOr(true)
                if (shouldClose) {
                    rl.closeWindow()
                }

                // Draw a simple frame
                rl.beginDrawing()
                    .andThen(() => rl.clearBackground(Colors.RAYWHITE))
                    .andThen(() => rl.drawText("Hello, Raylib!", 190, 200, 20, Colors.BLACK))
                    .andThen(() => rl.drawText("Press ESC to exit", 230, 250, 16, Colors.GRAY))
                    .andThen(() => rl.endDrawing())
                    .match(
                        () => {}, // Success - continue
                        (error) => {
                            console.error(`Frame error: [${error.kind}] ${error.message}`)
                            return // Exit on error
                        }
                    )
            }
            
            return rl.closeWindow()
        })

    // Handle final result
    result.match(
        () => console.log('Program completed successfully!'),
        (error) => {
            console.error(`Program failed: [${error.kind}] ${error.message}`)
            if (error.context) console.error(`Context: ${error.context}`)
        }
    )
}

main()