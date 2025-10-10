import { Colors } from "../src/constants";
import Raylib from "../src/Raylib";
import type { Vector2, RaylibError, RaylibErrorKind } from "../src/types";

function handleError(error: RaylibError): void {
    console.error(`[${error.kind}] ${error.message}`)
    if (error.context) {
        console.error(`Context: ${error.context}`)
    }
    if (error.source) {
        console.error(`Source: ${error.source.message}`)
    }
}

function main() {
    const rl = new Raylib()
    
    // Rust-style error handling with match
    const initResult = rl.initWindow(800, 450, 'Safe Raylib Example')
    
    if (initResult.isErr()) {
        handleError(initResult.error)
        return
    }

    // Chain operations with andThen
    const setupResult = rl.setTargetFPS(60)
    
    if (setupResult.isErr()) {
        handleError(setupResult.error)
        rl.closeWindow() // Always try to cleanup
        return
    }

    const position: Vector2 = { x: 100, y: 100 }
    
    // Main game loop with Result handling
    while (true) {
        const shouldCloseResult = rl.windowShouldClose()
        
        // Handle potential errors in window state check
        const shouldClose = shouldCloseResult.match(
            (value) => value,
            (error) => {
                handleError(error)
                return true // Exit on error
            }
        )
        
        if (shouldClose) break

        // Drawing with comprehensive error handling
        const frameResult = rl.beginDrawing()
            .andThen(() => rl.clearBackground(Colors.WHITE))
            .andThen(() => rl.drawFPS(0, 0))
            .andThen(() => rl.drawRectangle(50, 50, 100, 100, Colors.RED))
            .andThen(() => rl.drawRectangle(200, 50, 100, 100, Colors.GREEN))
            .andThen(() => rl.drawRectangle(350, 50, 100, 100, Colors.BLUE))
            .andThen(() => rl.drawRectangle(500, 50, 100, 100, Colors.YELLOW))
            .andThen(() => rl.drawRectangle(200, 200, 100, 100, Colors.BLACK))

        // Handle mouse position with Result
        const mouseResult = rl.getMousePosition()
            .andThen(mousePos => 
                rl.drawText(mousePos.x.toString(), position.x, position.y, 20, Colors.GREEN)
            )

        const deltaResult = rl.getMouseDelta()
            .andThen(mouseDelta =>
                rl.drawText(mouseDelta.x.toString(), position.x + 100, position.y + 100, 20, Colors.RED)
            )

        const endResult = rl.endDrawing()

        // Combine all results and handle errors
        const allResults = [frameResult, mouseResult, deltaResult, endResult]
        
        for (const result of allResults) {
            if (result.isErr()) {
                handleError(result.error)
                
                // Different strategies based on error type
                switch (result.error.kind) {
                    case 'DRAW_ERROR':
                        console.log('Continuing despite draw error...')
                        break
                    case 'STATE_ERROR':
                    case 'FFI_ERROR':
                        console.log('Critical error, exiting...')
                        rl.closeWindow()
                        return
                    default:
                        console.log('Unknown error, continuing...')
                }
            }
        }
    }

    // Cleanup with error handling
    const closeResult = rl.closeWindow()
    closeResult.match(
        () => console.log('Window closed successfully'),
        (error) => {
            console.error('Error closing window:')
            handleError(error)
        }
    )
}

// Alternative: More functional approach with early returns
function functionalMain() {
    const rl = new Raylib()
    
    return rl.initWindow(800, 450, 'Functional Raylib')
        .andThen(() => rl.setTargetFPS(60))
        .andThen(() => {
            console.log('Raylib initialized successfully!')
            
            // Game loop would go here
            const position: Vector2 = { x: 100, y: 100 }
            
            // For demo, just draw one frame
            return rl.beginDrawing()
                .andThen(() => rl.clearBackground(Colors.WHITE))
                .andThen(() => rl.drawText('Hello, Safe Raylib!', 190, 200, 20, Colors.BLACK))
                .andThen(() => rl.endDrawing())
                .andThen(() => rl.closeWindow())
        })
        .match(
            () => {
                console.log('Program completed successfully!')
                rl.closeWindow()
            },
            (error) => {
                console.error('Program failed:')
                handleError(error)
                rl.closeWindow() // Cleanup attempt
            }
        )
}

// Utility function for safe game loops
function safeGameLoop(
    rl: Raylib, 
    renderFrame: (rl: Raylib) => import('../src/result').Result<void, RaylibError>
) {
    while (true) {
        const shouldClose = rl.windowShouldClose().unwrapOr(true)
        if (shouldClose) break

        const frameResult = renderFrame(rl)
        
        if (frameResult.isErr()) {
            handleError(frameResult.error)
            
            // Decide whether to continue or exit based on error severity
            if (frameResult.error.kind === 'FFI_ERROR' || frameResult.error.kind === 'STATE_ERROR') {
                break
            }
        }
    }
}

// Example usage of safe game loop
function gameLoopExample() {
    const rl = new Raylib()
    
    rl.initWindow(800, 450, 'Game Loop Example')
        .andThen(() => rl.setTargetFPS(60))
        .match(
            () => {
                safeGameLoop(rl, (rl) => 
                    rl.beginDrawing()
                        .andThen(() => rl.clearBackground(Colors.WHITE))
                        .andThen(() => rl.drawText('Safe Game Loop!', 300, 200, 20, Colors.BLACK))
                        .andThen(() => rl.endDrawing())
                )
                
                rl.closeWindow().match(
                    () => console.log('Game ended successfully'),
                    (error) => handleError(error)
                )
            },
            (error) => {
                handleError(error)
                rl.closeWindow()
            }
        )
}

// Run the example
console.log('Running main example...')
main()

console.log('\nRunning functional example...')
functionalMain()

console.log('\nRunning game loop example...')
gameLoopExample()