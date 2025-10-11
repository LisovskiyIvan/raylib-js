import { Colors } from "./constants";
import Raylib from "./Raylib";
import type { RaylibError } from "./types";

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
    const initResult = rl.initWindow(800, 450, 'Raylib TypeScript')

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

    // Main game loop with Result handling
    while (rl.windowShouldClose().isOk) {
        const shouldCloseResult = rl.windowShouldClose()

        const shouldClose = shouldCloseResult.match(
            (value) => value,
            (error) => {
                handleError(error)
                return true // Exit on error
            }
        )

        if (shouldClose) {
            rl.closeWindow()
            break
        }

        rl.beginDrawing()
        rl.clearBackground(Colors.WHITE)

        for (let i = 0; i < 100; i++) {
            rl.drawLine(100, 100 + i, 200, 200 + i, Colors.RED)
        }

        rl.endDrawing()
    }
}

main()