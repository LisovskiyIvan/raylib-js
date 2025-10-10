import rl from './raylib-ffi'
import type { Vector2 } from './types'
import { ptr } from 'bun:ffi'

export default class Raylib {
    constructor() { }

    public InitWindow(width: number, height: number, title: string) {
        const titleBuffer = new TextEncoder().encode(title + '\0')
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
        const textBuffer = new TextEncoder().encode(text + '\0')
        const textPtr = ptr(textBuffer)
        rl.DrawText(textPtr, posX, posY, fontSize, color)
    }

    public DrawFPS(posX: number, posY: number) {
        rl.DrawFPS(posX, posY)
    }
}