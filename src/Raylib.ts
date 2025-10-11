import { initRaylib } from './raylib-ffi'
import type { RaylibResult } from './types'
import { initError, ffiError, stateError } from './types'
import { Ok, Err, tryFn} from './result'
import { ptr, suffix } from 'bun:ffi'
import { validateAll, validateFinite, validateNonEmptyString, validateNonNegative, validatePositive, validateRange, validateColor } from './validation'
import Vector2 from './math/Vector2'
import Rectangle from './math/Rectangle'


export default class Raylib {
    private previousMousePos: Vector2 = Vector2.Zero()
    private textEncoder = new TextEncoder()
    private isInitialized = false
    private windowWidth = 0
    private windowHeight = 0
    private rl: any

    constructor(libraryPath?: string) {
        // Используем путь по умолчанию, если не передан
        const defaultPath = `./assets/raylib-5.5_macos/lib/libraylib.${suffix}`
        const path = libraryPath || defaultPath
        
        try {
            this.rl = initRaylib(path)
        } catch (error) {
            throw new Error(`Failed to initialize Raylib: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

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
            this.rl.InitWindow(width, height, titlePtr)

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
            this.rl.CloseWindow()
            this.isInitialized = false
            this.windowWidth = 0
            this.windowHeight = 0
        })
    }

    public setTargetFPS(target: number): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => validateRange(target, 1, 1000, 'target FPS'))
            .andThen(() => this.safeFFICall('set target FPS', () => this.rl.SetTargetFPS(target)))
    }

    public windowShouldClose(): RaylibResult<boolean> {
        return this.requireInitialized()
            .andThen(() => this.safeFFICall('check window close state', () => this.rl.WindowShouldClose()))
    }

    // Drawing
    public beginDrawing(): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => this.safeFFICall('begin drawing', () => this.rl.BeginDrawing()))
    }

    public endDrawing(): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => this.safeFFICall('end drawing', () => this.rl.EndDrawing()))
    }

    public clearBackground(color: number): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => validateColor(color, 'color'))
            .andThen(() => this.safeFFICall('clear background', () => this.rl.ClearBackground(color)))
    }

    public drawRectangle(posX: number, posY: number, width: number, height: number, color: number): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateFinite(posX, 'posX'),
                validateFinite(posY, 'posY'),
                validateNonNegative(width, 'width'),
                validateNonNegative(height, 'height'),
                validateColor(color, 'color')
            ))
            .andThen(() => this.safeFFICall('draw rectangle', () =>
                this.rl.DrawRectangle(posX, posY, width, height, color)
            ))
    }

    public drawText(text: string, posX: number, posY: number, fontSize: number, color: number): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateNonEmptyString(text, 'text'),
                validateFinite(posX, 'posX'),
                validateFinite(posY, 'posY'),
                validatePositive(fontSize, 'fontSize'),
                validateColor(color, 'color')
            ))
            .andThen(() => this.safeFFICall('draw text', () => {
                const textBuffer = this.textEncoder.encode(text + '\0')
                const textPtr = ptr(textBuffer)
                this.rl.DrawText(textPtr, posX, posY, fontSize, color)
            }))
    }

    public drawFPS(posX: number, posY: number): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateFinite(posX, 'posX'),
                validateFinite(posY, 'posY')
            ))
            .andThen(() => this.safeFFICall('draw FPS', () => this.rl.DrawFPS(posX, posY)))
    }

    // Input
    public isKeyDown(key: number): RaylibResult<boolean> {
        return this.requireInitialized()
            .andThen(() => validateFinite(key, 'key'))
            .andThen(() => this.safeFFICall('check key down', () => this.rl.IsKeyDown(key)))
    }

    public isKeyUp(key: number): RaylibResult<boolean> {
        return this.requireInitialized()
            .andThen(() => validateFinite(key, 'key'))
            .andThen(() => this.safeFFICall('check key up', () => this.rl.IsKeyUp(key)))
    }

    public getKeyPressed(): RaylibResult<number> {
        return this.requireInitialized()
            .andThen(() => this.safeFFICall('get key pressed', () => this.rl.GetKeyPressed()))
    }

    public isMouseButtonDown(button: number): RaylibResult<boolean> {
        return this.requireInitialized()
            .andThen(() => validateFinite(button, 'button'))
            .andThen(() => this.safeFFICall('check mouse button down', () => this.rl.IsMouseButtonDown(button)))
    }

    public getMousePosition(): RaylibResult<Vector2> {
        return this.requireInitialized()
            .andThen(() => this.safeFFICall('get mouse position', () => new Vector2(this.rl.GetMouseX(), this.rl.GetMouseY())))
    }

    public getMouseDelta(): RaylibResult<Vector2> {
        const pos = this.getMousePosition().unwrap()
        const delta = pos.subtract(this.previousMousePos)
        this.previousMousePos.copyFrom(pos)
        return new Ok(delta)
    }

    public setMousePosition(x: number, y: number): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateFinite(x, 'x'),
                validateFinite(y, 'y')
            ))
            .andThen(() => this.safeFFICall('set mouse position', () => this.rl.SetMousePosition(x, y)))
    }

    public getFrameTime(): RaylibResult<number> {
        return this.requireInitialized()
            .andThen(() => this.safeFFICall('get frame time', () => this.rl.GetFrameTime()))
    }

    public drawPixel(posX: number, posY: number, color: number) {
        return this.requireInitialized()
        .andThen(() => validateColor(color, 'color'))
        .andThen(() => this.safeFFICall('draw a pixel', () => this.rl.DrawPixel(posX, posY, color)))
    }

    public drawPixelV(position: Vector2, color: number) {
        return this.requireInitialized()
        .andThen(() => validateColor(color, 'color'))
        .andThen(() => this.safeFFICall('draw a pixel', () => this.rl.DrawPixel(position.x, position.y, color)))
    }

    public drawLine(startX: number, startY: number, endX: number, endY: number, color: number) {
        return this.requireInitialized()
        .andThen(() => validateColor(color, 'color'))
        .andThen(() => this.safeFFICall('draw a line', () => this.rl.DrawLine(startX, startY, endX, endY, color)))
    }

    public drawLineV(start: Vector2, end: Vector2, color: number) {
        return this.requireInitialized()
        .andThen(() => validateColor(color, 'color'))
        .andThen(() => this.safeFFICall('draw a line', () => this.rl.DrawLine(start.x, start.y, end.x, end.y, color)))
    }

     public drawCircle(centerX: number, centerY: number, radius: number, color: number) {
        return this.requireInitialized()
        .andThen(() => validateColor(color, 'color'))
        .andThen(() => this.safeFFICall('draw a line', () => this.rl.DrawCircle(centerX, centerY, radius, color)))
    }

    public drawCircleV(center: Vector2, radius: number, color: number) {
        return this.requireInitialized()
        .andThen(() => validateColor(color, 'color'))
        .andThen(() => this.safeFFICall('draw a line', () => this.rl.DrawCircle(center.x, center.y, radius, color)))
    }

    public drawTriangle(v1: Vector2, v2: Vector2, v3: Vector2, color: number): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateFinite(v1.x, 'v1.x'),
                validateFinite(v1.y, 'v1.y'),
                validateFinite(v2.x, 'v2.x'),
                validateFinite(v2.y, 'v2.y'),
                validateFinite(v3.x, 'v3.x'),
                validateFinite(v3.y, 'v3.y'),
                validateColor(color, 'color')
            ))
            .andThen(() => this.safeFFICall('draw triangle', () =>
                this.rl.DrawTriangle(v1.x, v1.y, v2.x, v2.y, v3.x, v3.y, color)
            ))
    }

    public drawRectanglePro(rec: Rectangle, origin: Vector2, rotation: number, color: number): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateFinite(rec.x, 'rec.x'),
                validateFinite(rec.y, 'rec.y'),
                validateNonNegative(rec.width, 'rec.width'),
                validateNonNegative(rec.height, 'rec.height'),
                validateFinite(origin.x, 'origin.x'),
                validateFinite(origin.y, 'origin.y'),
                validateFinite(rotation, 'rotation'),
                validateColor(color, 'color')
            ))
            .andThen(() => this.safeFFICall('draw rectangle pro', () =>
                this.rl.DrawRectanglePro(rec.x, rec.y, rec.width, rec.height, origin.x, origin.y, rotation, color)
            ))
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