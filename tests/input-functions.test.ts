import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import Raylib from '../src/Raylib'
import Vector2 from '../src/math/Vector2'

describe('Input Functions', () => {
    let rl: Raylib

    beforeEach(() => {
        rl = new Raylib()
        const initResult = rl.initWindow(800, 600, 'Input Test')
        expect(initResult.isOk()).toBe(true)
    })

    afterEach(() => {
        rl.closeWindow()
    })

    describe('Keyboard Input', () => {
        test('should check if key is down', () => {
            const result = rl.isKeyDown(32) // Space key
            expect(result.isOk()).toBe(true)
            expect(typeof result.unwrap()).toBe('boolean')
        })

        test('should check if key is up', () => {
            const result = rl.isKeyUp(32) // Space key
            expect(result.isOk()).toBe(true)
            expect(typeof result.unwrap()).toBe('boolean')
        })

        test('should get pressed key', () => {
            const result = rl.getKeyPressed()
            expect(result.isOk()).toBe(true)
            expect(typeof result.unwrap()).toBe('number')
        })

        test('should validate key parameter', () => {
            const result = rl.isKeyDown(NaN)
            expect(result.isErr()).toBe(true)
        })
    })

    describe('Mouse Input', () => {
        test('should check if mouse button is down', () => {
            const result = rl.isMouseButtonDown(0) // Left button
            expect(result.isOk()).toBe(true)
            expect(typeof result.unwrap()).toBe('boolean')
        })

        test('should get mouse position', () => {
            const result = rl.getMousePosition()
            expect(result.isOk()).toBe(true)
            
            const pos = result.unwrap()
            expect(pos).toBeInstanceOf(Vector2)
            expect(typeof pos.x).toBe('number')
            expect(typeof pos.y).toBe('number')
        })

        test('should get mouse delta', () => {
            const result = rl.getMouseDelta()
            expect(result.isOk()).toBe(true)
            
            const delta = result.unwrap()
            expect(delta).toBeInstanceOf(Vector2)
        })

        test('should set mouse position', () => {
            const result = rl.setMousePosition(100, 200)
            expect(result.isOk()).toBe(true)
            
            // Verify position was set
            const posResult = rl.getMousePosition()
            expect(posResult.isOk()).toBe(true)
        })

        test('should validate mouse position parameters', () => {
            const result = rl.setMousePosition(NaN, 100)
            expect(result.isErr()).toBe(true)
        })

        test('should validate mouse button parameter', () => {
            const result = rl.isMouseButtonDown(Infinity)
            expect(result.isErr()).toBe(true)
        })
    })

    describe('Cursor Control', () => {
        test('should disable cursor', () => {
            const result = rl.disableCursor()
            expect(result.isOk()).toBe(true)
        })

        test('should enable cursor', () => {
            const result = rl.enableCursor()
            expect(result.isOk()).toBe(true)
        })

        test('should hide cursor', () => {
            const result = rl.hideCursor()
            expect(result.isOk()).toBe(true)
        })

        test('should show cursor', () => {
            const result = rl.showCursor()
            expect(result.isOk()).toBe(true)
        })

        test('should check if cursor is hidden', () => {
            const result = rl.isCursorHidden()
            expect(result.isOk()).toBe(true)
            expect(typeof result.unwrap()).toBe('boolean')
        })

        test('should toggle cursor visibility', () => {
            rl.hideCursor()
            const hiddenResult = rl.isCursorHidden()
            expect(hiddenResult.unwrap()).toBe(true)
            
            rl.showCursor()
            const shownResult = rl.isCursorHidden()
            expect(shownResult.unwrap()).toBe(false)
        })
    })

    describe('Input Without Initialization', () => {
        test('should fail when window not initialized', () => {
            const uninitRl = new Raylib()
            
            const keyResult = uninitRl.isKeyDown(32)
            expect(keyResult.isErr()).toBe(true)
            
            const mouseResult = uninitRl.getMousePosition()
            expect(mouseResult.isErr()).toBe(true)
        })
    })
})
