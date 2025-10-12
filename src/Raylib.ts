import { initRaylib } from './raylib-ffi'
import type { RaylibResult, Texture2D, RenderTexture2D } from './types'
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

    public drawRectangleRec(rec: Rectangle, color: number): RaylibResult<void> {
        return this.drawRectangle(rec.x, rec.y, rec.width, rec.height, color)
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

    // Collision detection
    public checkCollisionRecs(rec1: Rectangle, rec2: Rectangle): RaylibResult<boolean> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateFinite(rec1.x, 'rec1.x'),
                validateFinite(rec1.y, 'rec1.y'),
                validateNonNegative(rec1.width, 'rec1.width'),
                validateNonNegative(rec1.height, 'rec1.height'),
                validateFinite(rec2.x, 'rec2.x'),
                validateFinite(rec2.y, 'rec2.y'),
                validateNonNegative(rec2.width, 'rec2.width'),
                validateNonNegative(rec2.height, 'rec2.height')
            ))
            .andThen(() => this.safeFFICall('check collision rectangles', () =>
                this.rl.CheckCollisionRecs(rec1.x, rec1.y, rec1.width, rec1.height, rec2.x, rec2.y, rec2.width, rec2.height)
            ))
    }

    public checkCollisionCircles(center1: Vector2, radius1: number, center2: Vector2, radius2: number): RaylibResult<boolean> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateFinite(center1.x, 'center1.x'),
                validateFinite(center1.y, 'center1.y'),
                validateNonNegative(radius1, 'radius1'),
                validateFinite(center2.x, 'center2.x'),
                validateFinite(center2.y, 'center2.y'),
                validateNonNegative(radius2, 'radius2')
            ))
            .andThen(() => this.safeFFICall('check collision circles', () =>
                this.rl.CheckCollisionCircles(center1.x, center1.y, radius1, center2.x, center2.y, radius2)
            ))
    }

    public checkCollisionCircleRec(center: Vector2, radius: number, rec: Rectangle): RaylibResult<boolean> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateFinite(center.x, 'center.x'),
                validateFinite(center.y, 'center.y'),
                validateNonNegative(radius, 'radius'),
                validateFinite(rec.x, 'rec.x'),
                validateFinite(rec.y, 'rec.y'),
                validateNonNegative(rec.width, 'rec.width'),
                validateNonNegative(rec.height, 'rec.height')
            ))
            .andThen(() => this.safeFFICall('check collision circle rectangle', () =>
                this.rl.CheckCollisionCircleRec(center.x, center.y, radius, rec.x, rec.y, rec.width, rec.height)
            ))
    }

    public checkCollisionCircleLine(center: Vector2, radius: number, p1: Vector2, p2: Vector2): RaylibResult<boolean> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateFinite(center.x, 'center.x'),
                validateFinite(center.y, 'center.y'),
                validateNonNegative(radius, 'radius'),
                validateFinite(p1.x, 'p1.x'),
                validateFinite(p1.y, 'p1.y'),
                validateFinite(p2.x, 'p2.x'),
                validateFinite(p2.y, 'p2.y')
            ))
            .andThen(() => this.safeFFICall('check collision circle line', () =>
                this.rl.CheckCollisionCircleLine(center.x, center.y, radius, p1.x, p1.y, p2.x, p2.y)
            ))
    }

    public checkCollisionPointRec(point: Vector2, rec: Rectangle): RaylibResult<boolean> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateFinite(point.x, 'point.x'),
                validateFinite(point.y, 'point.y'),
                validateFinite(rec.x, 'rec.x'),
                validateFinite(rec.y, 'rec.y'),
                validateNonNegative(rec.width, 'rec.width'),
                validateNonNegative(rec.height, 'rec.height')
            ))
            .andThen(() => this.safeFFICall('check collision point rectangle', () =>
                this.rl.CheckCollisionPointRec(point.x, point.y, rec.x, rec.y, rec.width, rec.height)
            ))
    }

    public checkCollisionPointCircle(point: Vector2, center: Vector2, radius: number): RaylibResult<boolean> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateFinite(point.x, 'point.x'),
                validateFinite(point.y, 'point.y'),
                validateFinite(center.x, 'center.x'),
                validateFinite(center.y, 'center.y'),
                validateNonNegative(radius, 'radius')
            ))
            .andThen(() => this.safeFFICall('check collision point circle', () =>
                this.rl.CheckCollisionPointCircle(point.x, point.y, center.x, center.y, radius)
            ))
    }

    public checkCollisionPointTriangle(point: Vector2, p1: Vector2, p2: Vector2, p3: Vector2): RaylibResult<boolean> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateFinite(point.x, 'point.x'),
                validateFinite(point.y, 'point.y'),
                validateFinite(p1.x, 'p1.x'),
                validateFinite(p1.y, 'p1.y'),
                validateFinite(p2.x, 'p2.x'),
                validateFinite(p2.y, 'p2.y'),
                validateFinite(p3.x, 'p3.x'),
                validateFinite(p3.y, 'p3.y')
            ))
            .andThen(() => this.safeFFICall('check collision point triangle', () =>
                this.rl.CheckCollisionPointTriangle(point.x, point.y, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y)
            ))
    }

    // Multiple texture management
    public loadTexture(fileName: string): RaylibResult<number> {
        return this.requireInitialized()
            .andThen(() => validateNonEmptyString(fileName, 'fileName'))
            .andThen(() => this.safeFFICall('load texture to slot', () => {
                const fileNameBuffer = this.textEncoder.encode(fileName + '\0')
                const fileNamePtr = ptr(fileNameBuffer)
                
                const slotIndex = this.rl.LoadTextureToSlot(fileNamePtr)
                
                if (slotIndex < 0) {
                    throw new Error('Failed to load texture or no free slots available')
                }
                
                return slotIndex
            }))
    }

    public getTextureFromSlot(slotIndex: number): RaylibResult<Texture2D> {
        return this.requireInitialized()
            .andThen(() => validateFinite(slotIndex, 'slotIndex'))
            .andThen(() => this.safeFFICall('get texture from slot', () => {
                const id = this.rl.GetTextureIdBySlot(slotIndex)
                if (id === 0) {
                    throw new Error('Invalid slot index or texture not loaded')
                }
                
                const texture: Texture2D = {
                    id,
                    width: this.rl.GetTextureWidthBySlot(slotIndex),
                    height: this.rl.GetTextureHeightBySlot(slotIndex),
                    mipmaps: this.rl.GetTextureMipmapsBySlot(slotIndex),
                    format: this.rl.GetTextureFormatBySlot(slotIndex)
                }
                return texture
            }))
    }

    public unloadTextureFromSlot(slotIndex: number): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => validateFinite(slotIndex, 'slotIndex'))
            .andThen(() => this.safeFFICall('unload texture from slot', () => {
                this.rl.UnloadTextureBySlot(slotIndex)
            }))
    }

    public drawTextureFromSlot(slotIndex: number, posX: number, posY: number, tint: number): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateFinite(slotIndex, 'slotIndex'),
                validateFinite(posX, 'posX'),
                validateFinite(posY, 'posY'),
                validateColor(tint, 'tint')
            ))
            .andThen(() => this.safeFFICall('draw texture from slot', () => {
                this.rl.DrawTextureBySlot(slotIndex, posX, posY, tint)
            }))
    }

    public drawTextureProFromSlot(slotIndex: number, posX: number, posY: number, originX: number, originY: number, rotation: number, scale: number, tint: number): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateFinite(slotIndex, 'slotIndex'),
                validateFinite(posX, 'posX'),
                validateFinite(posY, 'posY'),
                validateFinite(originX, 'originX'),
                validateFinite(originY, 'originY'),
                validateFinite(rotation, 'rotation'),
                validateFinite(scale, 'scale'),
                validateColor(tint, 'tint')
            ))
            .andThen(() => this.safeFFICall('draw texture pro from slot', () => {
                this.rl.DrawTextureProBySlot(slotIndex, posX, posY, originX, originY, rotation, scale, tint)
            }))
    }

    public getLoadedTextureCount(): RaylibResult<number> {
        return this.requireInitialized()
            .andThen(() => this.safeFFICall('get loaded texture count', () => {
                return this.rl.GetLoadedTextureCount()
            }))
    }

    public unloadAllTextures(): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => this.safeFFICall('unload all textures', () => {
                this.rl.UnloadAllTextures()
            }))
    }

    // Render texture management
    public loadRenderTexture(width: number, height: number): RaylibResult<number> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validatePositive(width, 'width'),
                validatePositive(height, 'height')
            ))
            .andThen(() => this.safeFFICall('load render texture to slot', () => {
                const slotIndex = this.rl.LoadRenderTextureToSlot(width, height)
                
                if (slotIndex < 0) {
                    throw new Error('Failed to create render texture or no free slots available')
                }
                
                return slotIndex
            }))
    }

    public getRenderTextureFromSlot(slotIndex: number): RaylibResult<RenderTexture2D> {
        return this.requireInitialized()
            .andThen(() => validateFinite(slotIndex, 'slotIndex'))
            .andThen(() => this.safeFFICall('get render texture from slot', () => {
                const id = this.rl.GetRenderTextureIdBySlot(slotIndex)
                if (id === 0) {
                    throw new Error('Invalid slot index or render texture not loaded')
                }
                
                const texture: Texture2D = {
                    id: this.rl.GetRenderTextureColorIdBySlot(slotIndex),
                    width: this.rl.GetRenderTextureColorWidthBySlot(slotIndex),
                    height: this.rl.GetRenderTextureColorHeightBySlot(slotIndex),
                    mipmaps: this.rl.GetRenderTextureColorMipmapsBySlot(slotIndex),
                    format: this.rl.GetRenderTextureColorFormatBySlot(slotIndex)
                }

                const depth: Texture2D = {
                    id: this.rl.GetRenderTextureDepthIdBySlot(slotIndex),
                    width: this.rl.GetRenderTextureDepthWidthBySlot(slotIndex),
                    height: this.rl.GetRenderTextureDepthHeightBySlot(slotIndex),
                    mipmaps: this.rl.GetRenderTextureDepthMipmapsBySlot(slotIndex),
                    format: this.rl.GetRenderTextureDepthFormatBySlot(slotIndex)
                }

                const renderTexture: RenderTexture2D = {
                    id,
                    texture,
                    depth
                }
                return renderTexture
            }))
    }

    public unloadRenderTextureFromSlot(slotIndex: number): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => validateFinite(slotIndex, 'slotIndex'))
            .andThen(() => this.safeFFICall('unload render texture from slot', () => {
                this.rl.UnloadRenderTextureBySlot(slotIndex)
            }))
    }

    public getLoadedRenderTextureCount(): RaylibResult<number> {
        return this.requireInitialized()
            .andThen(() => this.safeFFICall('get loaded render texture count', () => {
                return this.rl.GetLoadedRenderTextureCount()
            }))
    }

    public unloadAllRenderTextures(): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => this.safeFFICall('unload all render textures', () => {
                this.rl.UnloadAllRenderTextures()
            }))
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