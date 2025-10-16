import { initRaylib } from './raylib-ffi'
import type { RaylibResult, Texture2D, RenderTexture2D, Model, BoundingBox } from './types'
import { initError, ffiError, stateError, validationError } from './types'
import { Ok, Err, tryFn } from './result'
import { ptr, suffix } from 'bun:ffi'
import { validateAll, validateFinite, validateNonEmptyString, validateNonNegative, validatePositive, validateRange, validateColor } from './validation'
import Vector2 from './math/Vector2'
import Vector3 from './math/Vector3'
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
        const defaultPath = `./assets/raylib/lib/libraylib.${suffix}`
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

    public disableCursor(): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => this.safeFFICall('disable cursor', () => this.rl.DisableCursor()))
    }

    public enableCursor(): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => this.safeFFICall('enable cursor', () => this.rl.EnableCursor()))
    }

    public hideCursor(): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => this.safeFFICall('hide cursor', () => this.rl.HideCursor()))
    }

    public showCursor(): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => this.safeFFICall('show cursor', () => this.rl.ShowCursor()))
    }

    public isCursorHidden(): RaylibResult<boolean> {
        return this.requireInitialized()
            .andThen(() => this.safeFFICall('check cursor hidden', () => this.rl.IsCursorHidden()))
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

    // 3D Camera and mode functions
    public beginMode3D(cameraPosition: Vector3, cameraTarget: Vector3, cameraUp: Vector3, fovy: number, projection: number): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateFinite(cameraPosition.x, 'cameraPosition.x'),
                validateFinite(cameraPosition.y, 'cameraPosition.y'),
                validateFinite(cameraPosition.z, 'cameraPosition.z'),
                validateFinite(cameraTarget.x, 'cameraTarget.x'),
                validateFinite(cameraTarget.y, 'cameraTarget.y'),
                validateFinite(cameraTarget.z, 'cameraTarget.z'),
                validateFinite(cameraUp.x, 'cameraUp.x'),
                validateFinite(cameraUp.y, 'cameraUp.y'),
                validateFinite(cameraUp.z, 'cameraUp.z'),
                validateFinite(fovy, 'fovy'),
                validateFinite(projection, 'projection')
            ))
            .andThen(() => this.safeFFICall('begin mode 3D', () => {
                // Create Camera3D structure as Float32Array
                // Camera3D: position(3f) + target(3f) + up(3f) + fovy(1f) + projection(1i)
                const camera = new Float32Array(11)
                camera[0] = cameraPosition.x
                camera[1] = cameraPosition.y
                camera[2] = cameraPosition.z
                camera[3] = cameraTarget.x
                camera[4] = cameraTarget.y
                camera[5] = cameraTarget.z
                camera[6] = cameraUp.x
                camera[7] = cameraUp.y
                camera[8] = cameraUp.z
                camera[9] = fovy
                camera[10] = projection

                this.rl.BeginMode3D(ptr(camera))
            }))
    }

    public endMode3D(): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => this.safeFFICall('end mode 3D', () => this.rl.EndMode3D()))
    }

    // 3D Drawing functions
    public drawLine3D(startPos: Vector3, endPos: Vector3, color: number): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateFinite(startPos.x, 'startPos.x'),
                validateFinite(startPos.y, 'startPos.y'),
                validateFinite(startPos.z, 'startPos.z'),
                validateFinite(endPos.x, 'endPos.x'),
                validateFinite(endPos.y, 'endPos.y'),
                validateFinite(endPos.z, 'endPos.z'),
                validateColor(color, 'color')
            ))
            .andThen(() => this.safeFFICall('draw line 3D', () =>
                this.rl.DrawLine3D(startPos.x, startPos.y, startPos.z, endPos.x, endPos.y, endPos.z, color)
            ))
    }

    public drawPoint3D(position: Vector3, color: number): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateFinite(position.x, 'position.x'),
                validateFinite(position.y, 'position.y'),
                validateFinite(position.z, 'position.z'),
                validateColor(color, 'color')
            ))
            .andThen(() => this.safeFFICall('draw point 3D', () =>
                this.rl.DrawPoint3D(position.x, position.y, position.z, color)
            ))
    }

    public drawCircle3D(center: Vector3, radius: number, rotationAxis: Vector3, rotationAngle: number, color: number): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateFinite(center.x, 'center.x'),
                validateFinite(center.y, 'center.y'),
                validateFinite(center.z, 'center.z'),
                validateNonNegative(radius, 'radius'),
                validateFinite(rotationAxis.x, 'rotationAxis.x'),
                validateFinite(rotationAxis.y, 'rotationAxis.y'),
                validateFinite(rotationAxis.z, 'rotationAxis.z'),
                validateFinite(rotationAngle, 'rotationAngle'),
                validateColor(color, 'color')
            ))
            .andThen(() => this.safeFFICall('draw circle 3D', () =>
                this.rl.DrawCircle3D(center.x, center.y, center.z, radius, rotationAxis.x, rotationAxis.y, rotationAxis.z, rotationAngle, color)
            ))
    }

    public drawTriangle3D(v1: Vector3, v2: Vector3, v3: Vector3, color: number): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateFinite(v1.x, 'v1.x'),
                validateFinite(v1.y, 'v1.y'),
                validateFinite(v1.z, 'v1.z'),
                validateFinite(v2.x, 'v2.x'),
                validateFinite(v2.y, 'v2.y'),
                validateFinite(v2.z, 'v2.z'),
                validateFinite(v3.x, 'v3.x'),
                validateFinite(v3.y, 'v3.y'),
                validateFinite(v3.z, 'v3.z'),
                validateColor(color, 'color')
            ))
            .andThen(() => this.safeFFICall('draw triangle 3D', () =>
                this.rl.DrawTriangle3D(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z, v3.x, v3.y, v3.z, color)
            ))
    }

    // Additional 3D shapes
    public drawCube(position: Vector3, width: number, height: number, length: number, color: number): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateFinite(position.x, 'position.x'),
                validateFinite(position.y, 'position.y'),
                validateFinite(position.z, 'position.z'),
                validateNonNegative(width, 'width'),
                validateNonNegative(height, 'height'),
                validateNonNegative(length, 'length'),
                validateColor(color, 'color')
            ))
            .andThen(() => this.safeFFICall('draw cube', () =>
                this.rl.DrawCube(position.x, position.y, position.z, width, height, length, color)
            ))
    }

    public drawCubeV(position: Vector3, size: Vector3, color: number): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateFinite(position.x, 'position.x'),
                validateFinite(position.y, 'position.y'),
                validateFinite(position.z, 'position.z'),
                validateNonNegative(size.x, 'size.x'),
                validateNonNegative(size.y, 'size.y'),
                validateNonNegative(size.z, 'size.z'),
                validateColor(color, 'color')
            ))
            .andThen(() => this.safeFFICall('draw cube V', () =>
                this.rl.DrawCubeV(position.x, position.y, position.z, size.x, size.y, size.z, color)
            ))
    }

    public drawSphere(centerPos: Vector3, radius: number, color: number): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateFinite(centerPos.x, 'centerPos.x'),
                validateFinite(centerPos.y, 'centerPos.y'),
                validateFinite(centerPos.z, 'centerPos.z'),
                validateNonNegative(radius, 'radius'),
                validateColor(color, 'color')
            ))
            .andThen(() => this.safeFFICall('draw sphere', () =>
                this.rl.DrawSphere(centerPos.x, centerPos.y, centerPos.z, radius, color)
            ))
    }

    public drawCylinder(position: Vector3, radiusTop: number, radiusBottom: number, height: number, slices: number, color: number): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateFinite(position.x, 'position.x'),
                validateFinite(position.y, 'position.y'),
                validateFinite(position.z, 'position.z'),
                validateNonNegative(radiusTop, 'radiusTop'),
                validateNonNegative(radiusBottom, 'radiusBottom'),
                validateNonNegative(height, 'height'),
                validatePositive(slices, 'slices'),
                validateColor(color, 'color')
            ))
            .andThen(() => this.safeFFICall('draw cylinder', () =>
                this.rl.DrawCylinder(position.x, position.y, position.z, radiusTop, radiusBottom, height, slices, color)
            ))
    }

    public drawCapsule(startPos: Vector3, endPos: Vector3, radius: number, slices: number, rings: number, color: number): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateFinite(startPos.x, 'startPos.x'),
                validateFinite(startPos.y, 'startPos.y'),
                validateFinite(startPos.z, 'startPos.z'),
                validateFinite(endPos.x, 'endPos.x'),
                validateFinite(endPos.y, 'endPos.y'),
                validateFinite(endPos.z, 'endPos.z'),
                validateNonNegative(radius, 'radius'),
                validatePositive(slices, 'slices'),
                validatePositive(rings, 'rings'),
                validateColor(color, 'color')
            ))
            .andThen(() => this.safeFFICall('draw capsule', () =>
                this.rl.DrawCapsule(startPos.x, startPos.y, startPos.z, endPos.x, endPos.y, endPos.z, radius, slices, rings, color)
            ))
    }

    public drawPlane(centerPos: Vector3, size: Vector2, color: number): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateFinite(centerPos.x, 'centerPos.x'),
                validateFinite(centerPos.y, 'centerPos.y'),
                validateFinite(centerPos.z, 'centerPos.z'),
                validateNonNegative(size.x, 'size.x'),
                validateNonNegative(size.y, 'size.y'),
                validateColor(color, 'color')
            ))
            .andThen(() => this.safeFFICall('draw plane', () =>
                this.rl.DrawPlane(centerPos.x, centerPos.y, centerPos.z, size.x, size.y, color)
            ))
    }

    public drawRay(rayPosition: Vector3, rayDirection: Vector3, color: number): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateFinite(rayPosition.x, 'rayPosition.x'),
                validateFinite(rayPosition.y, 'rayPosition.y'),
                validateFinite(rayPosition.z, 'rayPosition.z'),
                validateFinite(rayDirection.x, 'rayDirection.x'),
                validateFinite(rayDirection.y, 'rayDirection.y'),
                validateFinite(rayDirection.z, 'rayDirection.z'),
                validateColor(color, 'color')
            ))
            .andThen(() => this.safeFFICall('draw ray', () => {
                // Create Ray structure as Float32Array
                // Ray: position(3f) + direction(3f)
                const ray = new Float32Array(6)
                ray[0] = rayPosition.x
                ray[1] = rayPosition.y
                ray[2] = rayPosition.z
                ray[3] = rayDirection.x
                ray[4] = rayDirection.y
                ray[5] = rayDirection.z

                this.rl.DrawRay(ptr(ray), color)
            }))
    }

    public drawGrid(slices: number, spacing: number): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validatePositive(slices, 'slices'),
                validatePositive(spacing, 'spacing')
            ))
            .andThen(() => this.safeFFICall('draw grid', () =>
                this.rl.DrawGrid(slices, spacing)
            ))
    }

    // Model loading/unloading functions
    // TODO: optimize ffi calls
    public loadModel(fileName: string): RaylibResult<Model> {
        return this.requireInitialized()
            .andThen(() => validateNonEmptyString(fileName, 'fileName'))
            .andThen(() => this.safeFFICall('load model to slot', () => {
                const fileNameBuffer = this.textEncoder.encode(fileName + '\0')
                const fileNamePtr = ptr(fileNameBuffer)

                const slotIndex = this.rl.LoadModelToSlot(fileNamePtr)
                if (slotIndex < 0) {
                    throw new Error('Failed to load model or no free slots available')
                }

                const model: Model = {
                    slotIndex,
                    meshCount: this.rl.GetModelMeshCountBySlot(slotIndex),
                    materialCount: this.rl.GetModelMaterialCountBySlot(slotIndex)
                }

                return model
            }))
    }

    public unloadModel(model: Model): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => {
                if (model.slotIndex < 0) {
                    return new Err(validationError('Invalid model slot index'))
                }
                return this.safeFFICall('unload model from slot', () => {
                    this.rl.UnloadModelBySlot(model.slotIndex)
                })
            })
    }

    // TODO: do just one ffi call
    public getModelBoundingBox(model: Model): RaylibResult<BoundingBox> {
        return this.requireInitialized()
            .andThen(() => {
                if (model.slotIndex < 0) {
                    return new Err(validationError('Invalid model slot index'))
                }
                return this.safeFFICall('get model bounding box', () => {
                    const boundingBox: BoundingBox = {
                        min: {
                            x: this.rl.GetModelBoundingBoxMinXBySlot(model.slotIndex),
                            y: this.rl.GetModelBoundingBoxMinYBySlot(model.slotIndex),
                            z: this.rl.GetModelBoundingBoxMinZBySlot(model.slotIndex)
                        },
                        max: {
                            x: this.rl.GetModelBoundingBoxMaxXBySlot(model.slotIndex),
                            y: this.rl.GetModelBoundingBoxMaxYBySlot(model.slotIndex),
                            z: this.rl.GetModelBoundingBoxMaxZBySlot(model.slotIndex)
                        }
                    }

                    return boundingBox
                })
            })
    }

    // Additional model functions
    public drawModel(model: Model, position: Vector3, scale: number, tint: number): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateFinite(model.slotIndex, 'model.slotIndex'),
                validateFinite(position.x, 'position.x'),
                validateFinite(position.y, 'position.y'),
                validateFinite(position.z, 'position.z'),
                validateFinite(scale, 'scale'),
                validateColor(tint, 'tint')
            ))
            .andThen(() => this.safeFFICall('draw model', () => {
                this.rl.DrawModelBySlot(model.slotIndex, position.x, position.y, position.z, scale, tint)
            }))
    }

    public drawModelEx(model: Model, position: Vector3, rotationAxis: Vector3, rotationAngle: number, scale: Vector3, tint: number): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateFinite(model.slotIndex, 'model.slotIndex'),
                validateFinite(position.x, 'position.x'),
                validateFinite(position.y, 'position.y'),
                validateFinite(position.z, 'position.z'),
                validateFinite(rotationAxis.x, 'rotationAxis.x'),
                validateFinite(rotationAxis.y, 'rotationAxis.y'),
                validateFinite(rotationAxis.z, 'rotationAxis.z'),
                validateFinite(rotationAngle, 'rotationAngle'),
                validateFinite(scale.x, 'scale.x'),
                validateFinite(scale.y, 'scale.y'),
                validateFinite(scale.z, 'scale.z'),
                validateColor(tint, 'tint')
            ))
            .andThen(() => this.safeFFICall('draw model ex', () => {
                this.rl.DrawModelExBySlot(model.slotIndex, position.x, position.y, position.z,
                    rotationAxis.x, rotationAxis.y, rotationAxis.z, rotationAngle,
                    scale.x, scale.y, scale.z, tint)
            }))
    }

    public drawModelWires(model: Model, position: Vector3, scale: number, tint: number): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateFinite(model.slotIndex, 'model.slotIndex'),
                validateFinite(position.x, 'position.x'),
                validateFinite(position.y, 'position.y'),
                validateFinite(position.z, 'position.z'),
                validateFinite(scale, 'scale'),
                validateColor(tint, 'tint')
            ))
            .andThen(() => this.safeFFICall('draw model wires', () => {
                this.rl.DrawModelWiresBySlot(model.slotIndex, position.x, position.y, position.z, scale, tint)
            }))
    }

    public getLoadedModelCount(): RaylibResult<number> {
        return this.requireInitialized()
            .andThen(() => this.safeFFICall('get loaded model count', () => {
                return this.rl.GetLoadedModelCount()
            }))
    }

    public unloadAllModels(): RaylibResult<void> {
        return this.requireInitialized()
            .andThen(() => this.safeFFICall('unload all models', () => {
                this.rl.UnloadAllModels()
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

    // 3D Collision detection functions
    public checkCollisionSpheres(center1: Vector3, radius1: number, center2: Vector3, radius2: number): RaylibResult<boolean> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateFinite(center1.x, 'center1.x'),
                validateFinite(center1.y, 'center1.y'),
                validateFinite(center1.z, 'center1.z'),
                validateNonNegative(radius1, 'radius1'),
                validateFinite(center2.x, 'center2.x'),
                validateFinite(center2.y, 'center2.y'),
                validateFinite(center2.z, 'center2.z'),
                validateNonNegative(radius2, 'radius2')
            ))
            .andThen(() => this.safeFFICall('check collision spheres', () =>
                this.rl.CheckCollisionSpheres(center1.x, center1.y, center1.z, radius1, center2.x, center2.y, center2.z, radius2)
            ))
    }

    public checkCollisionBoxes(box1: BoundingBox, box2: BoundingBox): RaylibResult<boolean> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateFinite(box1.min.x, 'box1.min.x'),
                validateFinite(box1.min.y, 'box1.min.y'),
                validateFinite(box1.min.z, 'box1.min.z'),
                validateFinite(box1.max.x, 'box1.max.x'),
                validateFinite(box1.max.y, 'box1.max.y'),
                validateFinite(box1.max.z, 'box1.max.z'),
                validateFinite(box2.min.x, 'box2.min.x'),
                validateFinite(box2.min.y, 'box2.min.y'),
                validateFinite(box2.min.z, 'box2.min.z'),
                validateFinite(box2.max.x, 'box2.max.x'),
                validateFinite(box2.max.y, 'box2.max.y'),
                validateFinite(box2.max.z, 'box2.max.z')
            ))
            .andThen(() => this.safeFFICall('check collision boxes', () => {
                // Create BoundingBox structures as Float32Array
                const box1Array = new Float32Array(6)
                box1Array[0] = box1.min.x
                box1Array[1] = box1.min.y
                box1Array[2] = box1.min.z
                box1Array[3] = box1.max.x
                box1Array[4] = box1.max.y
                box1Array[5] = box1.max.z

                const box2Array = new Float32Array(6)
                box2Array[0] = box2.min.x
                box2Array[1] = box2.min.y
                box2Array[2] = box2.min.z
                box2Array[3] = box2.max.x
                box2Array[4] = box2.max.y
                box2Array[5] = box2.max.z

                return this.rl.CheckCollisionBoxes(ptr(box1Array), ptr(box2Array))
            }))
    }

    public checkCollisionBoxSphere(box: BoundingBox, center: Vector3, radius: number): RaylibResult<boolean> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateFinite(box.min.x, 'box.min.x'),
                validateFinite(box.min.y, 'box.min.y'),
                validateFinite(box.min.z, 'box.min.z'),
                validateFinite(box.max.x, 'box.max.x'),
                validateFinite(box.max.y, 'box.max.y'),
                validateFinite(box.max.z, 'box.max.z'),
                validateFinite(center.x, 'center.x'),
                validateFinite(center.y, 'center.y'),
                validateFinite(center.z, 'center.z'),
                validateNonNegative(radius, 'radius')
            ))
            .andThen(() => this.safeFFICall('check collision box sphere', () => {
                // Create BoundingBox structure as Float32Array
                const boxArray = new Float32Array(6)
                boxArray[0] = box.min.x
                boxArray[1] = box.min.y
                boxArray[2] = box.min.z
                boxArray[3] = box.max.x
                boxArray[4] = box.max.y
                boxArray[5] = box.max.z

                return this.rl.CheckCollisionBoxSphere(ptr(boxArray), center.x, center.y, center.z, radius)
            }))
    }

    public getRayCollisionSphere(rayPosition: Vector3, rayDirection: Vector3, center: Vector3, radius: number): RaylibResult<import('./types').RayCollision> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateFinite(rayPosition.x, 'rayPosition.x'),
                validateFinite(rayPosition.y, 'rayPosition.y'),
                validateFinite(rayPosition.z, 'rayPosition.z'),
                validateFinite(rayDirection.x, 'rayDirection.x'),
                validateFinite(rayDirection.y, 'rayDirection.y'),
                validateFinite(rayDirection.z, 'rayDirection.z'),
                validateFinite(center.x, 'center.x'),
                validateFinite(center.y, 'center.y'),
                validateFinite(center.z, 'center.z'),
                validateNonNegative(radius, 'radius')
            ))
            .andThen(() => this.safeFFICall('get ray collision sphere', () => {
                // Create Ray structure as Float32Array
                const rayArray = new Float32Array(6)
                rayArray[0] = rayPosition.x
                rayArray[1] = rayPosition.y
                rayArray[2] = rayPosition.z
                rayArray[3] = rayDirection.x
                rayArray[4] = rayDirection.y
                rayArray[5] = rayDirection.z

                const outBuffer = new Float32Array(8)
                this.rl.GetRayCollisionSphereWrapper(ptr(rayArray), center.x, center.y, center.z, radius, ptr(outBuffer))

                return {
                    hit: outBuffer[0]! !== 0,
                    distance: outBuffer[1]!,
                    point: {
                        x: outBuffer[2]!,
                        y: outBuffer[3]!,
                        z: outBuffer[4]!
                    },
                    normal: {
                        x: outBuffer[5]!,
                        y: outBuffer[6]!,
                        z: outBuffer[7]!
                    }
                }
            }))
    }

    public getRayCollisionBox(rayPosition: Vector3, rayDirection: Vector3, box: BoundingBox): RaylibResult<import('./types').RayCollision> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateFinite(rayPosition.x, 'rayPosition.x'),
                validateFinite(rayPosition.y, 'rayPosition.y'),
                validateFinite(rayPosition.z, 'rayPosition.z'),
                validateFinite(rayDirection.x, 'rayDirection.x'),
                validateFinite(rayDirection.y, 'rayDirection.y'),
                validateFinite(rayDirection.z, 'rayDirection.z'),
                validateFinite(box.min.x, 'box.min.x'),
                validateFinite(box.min.y, 'box.min.y'),
                validateFinite(box.min.z, 'box.min.z'),
                validateFinite(box.max.x, 'box.max.x'),
                validateFinite(box.max.y, 'box.max.y'),
                validateFinite(box.max.z, 'box.max.z')
            ))
            .andThen(() => this.safeFFICall('get ray collision box', () => {
                // Create Ray structure as Float32Array
                const rayArray = new Float32Array(6)
                rayArray[0] = rayPosition.x
                rayArray[1] = rayPosition.y
                rayArray[2] = rayPosition.z
                rayArray[3] = rayDirection.x
                rayArray[4] = rayDirection.y
                rayArray[5] = rayDirection.z

                // Create BoundingBox structure as Float32Array
                const boxArray = new Float32Array(6)
                boxArray[0] = box.min.x
                boxArray[1] = box.min.y
                boxArray[2] = box.min.z
                boxArray[3] = box.max.x
                boxArray[4] = box.max.y
                boxArray[5] = box.max.z

                const outBuffer = new Float32Array(8)
                this.rl.GetRayCollisionBoxWrapper(ptr(rayArray), ptr(boxArray), ptr(outBuffer))

                return {
                    hit: outBuffer[0]! !== 0,
                    distance: outBuffer[1]!,
                    point: {
                        x: outBuffer[2]!,
                        y: outBuffer[3]!,
                        z: outBuffer[4]!
                    },
                    normal: {
                        x: outBuffer[5]!,
                        y: outBuffer[6]!,
                        z: outBuffer[7]!
                    }
                }
            }))
    }

    public getRayCollisionTriangle(rayPosition: Vector3, rayDirection: Vector3, p1: Vector3, p2: Vector3, p3: Vector3): RaylibResult<import('./types').RayCollision> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateFinite(rayPosition.x, 'rayPosition.x'),
                validateFinite(rayPosition.y, 'rayPosition.y'),
                validateFinite(rayPosition.z, 'rayPosition.z'),
                validateFinite(rayDirection.x, 'rayDirection.x'),
                validateFinite(rayDirection.y, 'rayDirection.y'),
                validateFinite(rayDirection.z, 'rayDirection.z'),
                validateFinite(p1.x, 'p1.x'),
                validateFinite(p1.y, 'p1.y'),
                validateFinite(p1.z, 'p1.z'),
                validateFinite(p2.x, 'p2.x'),
                validateFinite(p2.y, 'p2.y'),
                validateFinite(p2.z, 'p2.z'),
                validateFinite(p3.x, 'p3.x'),
                validateFinite(p3.y, 'p3.y'),
                validateFinite(p3.z, 'p3.z')
            ))
            .andThen(() => this.safeFFICall('get ray collision triangle optimized', () => {
                // Create Ray structure as Float32Array
                const rayArray = new Float32Array(6)
                rayArray[0] = rayPosition.x
                rayArray[1] = rayPosition.y
                rayArray[2] = rayPosition.z
                rayArray[3] = rayDirection.x
                rayArray[4] = rayDirection.y
                rayArray[5] = rayDirection.z

                const outBuffer = new Float32Array(8)
                this.rl.GetRayCollisionTriangleWrapper(ptr(rayArray), p1.x, p1.y, p1.z, p2.x, p2.y, p2.z, p3.x, p3.y, p3.z, ptr(outBuffer))

                return {
                    hit: outBuffer[0]! !== 0,
                    distance: outBuffer[1]!,
                    point: {
                        x: outBuffer[2]!,
                        y: outBuffer[3]!,
                        z: outBuffer[4]!
                    },
                    normal: {
                        x: outBuffer[5]!,
                        y: outBuffer[6]!,
                        z: outBuffer[7]!
                    }
                }
            }))
    }

    public getRayCollisionMesh(rayPosition: Vector3, rayDirection: Vector3, model: import('./types').Model, meshIndex: number, transform?: import('./types').Matrix): RaylibResult<import('./types').RayCollision> {
        return this.requireInitialized()
            .andThen(() => validateAll(
                validateFinite(rayPosition.x, 'rayPosition.x'),
                validateFinite(rayPosition.y, 'rayPosition.y'),
                validateFinite(rayPosition.z, 'rayPosition.z'),
                validateFinite(rayDirection.x, 'rayDirection.x'),
                validateFinite(rayDirection.y, 'rayDirection.y'),
                validateFinite(rayDirection.z, 'rayDirection.z'),
                validateFinite(model.slotIndex, 'model.slotIndex'),
                validateFinite(meshIndex, 'meshIndex')
            ))
            .andThen(() => this.safeFFICall('get ray collision mesh', () => {
                // Create Ray structure as Float32Array
                const rayArray = new Float32Array(6)
                rayArray[0] = rayPosition.x
                rayArray[1] = rayPosition.y
                rayArray[2] = rayPosition.z
                rayArray[3] = rayDirection.x
                rayArray[4] = rayDirection.y
                rayArray[5] = rayDirection.z

                // Create transform matrix if provided, otherwise use identity
                let transformArray: Float32Array | null = null
                if (transform) {
                    transformArray = new Float32Array(16)
                    transformArray[0] = transform.m0
                    transformArray[1] = transform.m1
                    transformArray[2] = transform.m2
                    transformArray[3] = transform.m3
                    transformArray[4] = transform.m4
                    transformArray[5] = transform.m5
                    transformArray[6] = transform.m6
                    transformArray[7] = transform.m7
                    transformArray[8] = transform.m8
                    transformArray[9] = transform.m9
                    transformArray[10] = transform.m10
                    transformArray[11] = transform.m11
                    transformArray[12] = transform.m12
                    transformArray[13] = transform.m13
                    transformArray[14] = transform.m14
                    transformArray[15] = transform.m15
                }

                // Output buffer for collision result
                const outBuffer = new Float32Array(8)

                // Call the wrapper function
                this.rl.GetRayCollisionModelMesh(
                    ptr(rayArray),
                    model.slotIndex,
                    meshIndex,
                    transformArray ? ptr(transformArray) : null,
                    ptr(outBuffer)
                )

                return {
                    hit: outBuffer[0]! !== 0,
                    distance: outBuffer[1]!,
                    point: {
                        x: outBuffer[2]!,
                        y: outBuffer[3]!,
                        z: outBuffer[4]!
                    },
                    normal: {
                        x: outBuffer[5]!,
                        y: outBuffer[6]!,
                        z: outBuffer[7]!
                    }
                }
            }))
    }


}