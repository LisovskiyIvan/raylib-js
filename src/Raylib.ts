import rl from './raylib-ffi'
import type { Vector2 } from './types'
import { ptr } from 'bun:ffi'

export default class Raylib {
    private previousMousePos: Vector2 = { x: 0, y: 0 }
    private textEncoder = new TextEncoder()

    constructor() { }

    public InitWindow(width: number, height: number, title: string) {
        const titleBuffer = this.textEncoder.encode(title + '\0')
        const titlePtr = ptr(titleBuffer)
        rl.InitWindow(width, height, titlePtr)
    }

    public SetTargetFPS(target: number) {
        rl.SetTargetFPS(target)
    }

    public WindowShouldClose(): boolean {
        return rl.WindowShouldClose()
    }

    public BeginDrawing() {
        rl.BeginDrawing()
    }

    public EndDrawing() {
        rl.EndDrawing()
    }

    public ClearBackground(color: number) {
        rl.ClearBackground(color)
    }

    public DrawRectangle(posX: number, posY: number, width: number, height: number, color: number) {
        rl.DrawRectangle(posX, posY, width, height, color)
    }

    public DrawRectangleV(pos: Vector2, size: Vector2, color: number) {
        rl.DrawRectangle(pos.x, pos.y, size.x, size.y, color)
    }

    public CloseWindow() {
        rl.CloseWindow()
    }

    public DrawText(text: string, posX: number, posY: number, fontSize: number, color: number) {
        const textBuffer = this.textEncoder.encode(text + '\0')
        const textPtr = ptr(textBuffer)
        rl.DrawText(textPtr, posX, posY, fontSize, color)
    }

    public DrawFPS(posX: number, posY: number) {
        rl.DrawFPS(posX, posY)
    }

    public GetFrameTime() {
        return rl.GetFrameTime()
    }

    public IsKeyDown(key: number): boolean {
        return rl.IsKeyDown(key)
    }

    public IsKeyUp(key: number): boolean {
        return rl.IsKeyUp(key)
    }

    public GetKeyPressed() {
        return rl.GetKeyPressed()
    }

    public IsMouseButtonDown(button: number): boolean {
        return rl.IsMouseButtonDown(button)
    }

    public IsMouseButtonUp(button: number): boolean {
        return rl.IsMouseButtonUp(button)
    }

    public GetMouseX(): number {
        return rl.GetMouseX()
    }

    public GetMouseY(): number {
        return rl.GetMouseY()
    }

    public GetMousePosition(): Vector2 {
        return {
            x: this.GetMouseX(),
            y: this.GetMouseY()
        }
    }

    public GetMouseDelta(): Vector2 {
        const currentPos = this.GetMousePosition()
        const delta = {
            x: currentPos.x - this.previousMousePos.x,
            y: currentPos.y - this.previousMousePos.y
        }
        this.previousMousePos = currentPos
        return delta
    }

    public SetMousePosition(x: number, y: number) {
        rl.SetMousePosition(x, y)
    }

}