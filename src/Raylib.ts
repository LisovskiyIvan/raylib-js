import rl from './raylib-ffi'
import type { Vector2, RaylibResult } from './types'
import { initError, ffiError, stateError } from './types'
import { Ok, Err, tryFn} from './result'
import { ptr } from 'bun:ffi'
import { validateAll, validateFinite, validateNonEmptyString, validateNonNegative, validatePositive, validateRange } from './validation'


export default class Raylib {
    private previousMousePos: Vector2 = { x: 0, y: 0 }
    private textEncoder = new TextEncoder()
    private isInitialized = false
    private windowWidth = 0
    private windowHeight = 0

    constructor() { }

    private requireInitialized(): RaylibResult<void> {
        if (!this.isInitialized) {
            return new Err(stateError('Window must be initialized before calling this method'))
        }
        return new Ok(undefined)
    }

    private safeFFICall<T>(operation: string, fn: () => T): RaylibResult<T> {
        return tryFn(fn).mapErr(error =>
            ffiError(`Failed to ${operation}`, error instanceof Error ? error : new Error(String(error)))
        )
    }

    // Window management
    public initWindow(width: number, height: number, title: string): RaylibResult<void> {
        // Validate all parameters at once
        const validationResult = validateAll(
            validatePositive(width, 'width'),
            validatePositive(height, 'height'),
            validateNonEmptyString(title, 'title')
        )

        if (validationResult.isErr()) {
            return validationResult
        }

        // Check if already initialized
        if (this.isInitialized) {
            return new Err(initError('Window is already initialized', 'call closeWindow() first'))
        }

        // Try to initialize
        return this.safeFFICall('initialize window', () => {
            const titleBuffer = this.textEncoder.encode(title + '\0')
            const titlePtr = ptr(titleBuffer)
            rl.InitWindow(width, height, titlePtr)

            this.isInitialized = true
            this.windowWidth = width
            this.windowHeight = height
        })
    }

    public closeWindow(): RaylibResult<void> {
        if (!this.isInitialized) {
            return new Ok(undefined) // Not an error if already closed
        }

        return this.safeFFICall('close window', () => {
            rl.CloseWindow()
            this.isInitialized = false
            this.windowWidth = 0
            this.windowHeight = 0
        })
    }

    public setTargetFPS(target: number): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => validateRange(target, 1, 1000, 'target FPS'))
            .andThen(() => this.safeFFICall('set target FPS', () => rl.SetTargetFPS(target)))
    }

    public windowShouldClose(): RaylibResult<boolean> {
        return this.requireInitialized()
            .andThen(() => this.safeFFICall('check window close state', () => rl.WindowShouldClose()))
    }

    // Drawing
    public beginDrawing(): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => this.safeFFICall('begin drawing', () => rl.BeginDrawing()))
    }

    public endDrawing(): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => this.safeFFICall('end drawing', () => rl.EndDrawing()))
    }

    public clearBackground(color: number): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => validateFinite(color, 'color'))
            .andThen(() => this.safeFFICall('clear background', () => rl.ClearBackground(color)))
    }

    public drawRectangle(posX: number, posY: number, width: number, height: number, color: number): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateFinite(posX, 'posX'),
                validateFinite(posY, 'posY'),
                validateNonNegative(width, 'width'),
                validateNonNegative(height, 'height'),
                validateFinite(color, 'color')
            ))
            .andThen(() => this.safeFFICall('draw rectangle', () =>
                rl.DrawRectangle(posX, posY, width, height, color)
            ))
    }

    public drawText(text: string, posX: number, posY: number, fontSize: number, color: number): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateNonEmptyString(text, 'text'),
                validateFinite(posX, 'posX'),
                validateFinite(posY, 'posY'),
                validatePositive(fontSize, 'fontSize'),
                validateFinite(color, 'color')
            ))
            .andThen(() => this.safeFFICall('draw text', () => {
                const textBuffer = this.textEncoder.encode(text + '\0')
                const textPtr = ptr(textBuffer)
                rl.DrawText(textPtr, posX, posY, fontSize, color)
            }))
    }

    public drawFPS(posX: number, posY: number): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateFinite(posX, 'posX'),
                validateFinite(posY, 'posY')
            ))
            .andThen(() => this.safeFFICall('draw FPS', () => rl.DrawFPS(posX, posY)))
    }

    // Input
    public isKeyDown(key: number): RaylibResult<boolean> {
        return this.requireInitialized()
            .andThen(() => validateFinite(key, 'key'))
            .andThen(() => this.safeFFICall('check key down', () => rl.IsKeyDown(key)))
    }

    public isKeyUp(key: number): RaylibResult<boolean> {
        return this.requireInitialized()
            .andThen(() => validateFinite(key, 'key'))
            .andThen(() => this.safeFFICall('check key up', () => rl.IsKeyUp(key)))
    }

    public getKeyPressed(): RaylibResult<number> {
        return this.requireInitialized()
            .andThen(() => this.safeFFICall('get key pressed', () => rl.GetKeyPressed()))
    }

    public isMouseButtonDown(button: number): RaylibResult<boolean> {
        return this.requireInitialized()
            .andThen(() => validateFinite(button, 'button'))
            .andThen(() => this.safeFFICall('check mouse button down', () => rl.IsMouseButtonDown(button)))
    }

    public getMousePosition(): RaylibResult<Vector2> {
        return this.requireInitialized()
            .andThen(() => this.safeFFICall('get mouse position', () => ({
                x: rl.GetMouseX(),
                y: rl.GetMouseY()
            })))
    }

    public getMouseDelta(): RaylibResult<Vector2> {
        return this.getMousePosition()
            .map(currentPos => {
                const delta = {
                    x: currentPos.x - this.previousMousePos.x,
                    y: currentPos.y - this.previousMousePos.y
                }
                this.previousMousePos = currentPos
                return delta
            })
    }

    public setMousePosition(x: number, y: number): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateFinite(x, 'x'),
                validateFinite(y, 'y')
            ))
            .andThen(() => this.safeFFICall('set mouse position', () => rl.SetMousePosition(x, y)))
    }

    public getFrameTime(): RaylibResult<number> {
        return this.requireInitialized()
            .andThen(() => this.safeFFICall('get frame time', () => rl.GetFrameTime()))
    }

    // State getters
    public get initialized(): boolean {
        return this.isInitialized
    }

    public get width(): number {
        return this.windowWidth
    }

    public get height(): number {
        return this.windowHeight
    }
}