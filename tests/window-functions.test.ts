import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import Raylib from '../src/Raylib'

describe('Window Functions', () => {
    let rl: Raylib

    beforeEach(() => {
        rl = new Raylib()
    })

    afterEach(() => {
        if (rl.initialized) {
            rl.closeWindow()
        }
    })

    describe('Window Should Close', () => {
        test('should check if window should close', () => {
            const initResult = rl.initWindow(800, 600, 'Window Test')
            expect(initResult.isOk()).toBe(true)

            const shouldCloseResult = rl.windowShouldClose()
            expect(shouldCloseResult.isOk()).toBe(true)
            expect(typeof shouldCloseResult.unwrap()).toBe('boolean')
            
            // Initially should not close
            expect(shouldCloseResult.unwrap()).toBe(false)
        })

        test('should fail when window not initialized', () => {
            const result = rl.windowShouldClose()
            expect(result.isErr()).toBe(true)
        })
    })

    describe('Frame Time', () => {
        test('should get frame time', () => {
            const initResult = rl.initWindow(800, 600, 'Frame Time Test')
            expect(initResult.isOk()).toBe(true)

            const frameTimeResult = rl.getFrameTime()
            expect(frameTimeResult.isOk()).toBe(true)
            
            const frameTime = frameTimeResult.unwrap()
            expect(typeof frameTime).toBe('number')
            expect(frameTime).toBeGreaterThanOrEqual(0)
        })

        test('should fail when window not initialized', () => {
            const result = rl.getFrameTime()
            expect(result.isErr()).toBe(true)
        })

        test('should get consistent frame time values', () => {
            const initResult = rl.initWindow(800, 600, 'Frame Time Test')
            expect(initResult.isOk()).toBe(true)

            rl.setTargetFPS(60)

            // Simulate a few frames
            for (let i = 0; i < 3; i++) {
                rl.beginDrawing()
                rl.endDrawing()
                
                const frameTimeResult = rl.getFrameTime()
                expect(frameTimeResult.isOk()).toBe(true)
                
                const frameTime = frameTimeResult.unwrap()
                expect(frameTime).toBeGreaterThanOrEqual(0)
                expect(frameTime).toBeLessThan(1) // Should be less than 1 second
            }
        })
    })

    describe('Window State', () => {
        test('should track initialization state', () => {
            expect(rl.initialized).toBe(false)

            const initResult = rl.initWindow(800, 600, 'State Test')
            expect(initResult.isOk()).toBe(true)
            expect(rl.initialized).toBe(true)

            const closeResult = rl.closeWindow()
            expect(closeResult.isOk()).toBe(true)
            expect(rl.initialized).toBe(false)
        })

        test('should track window dimensions', () => {
            const width = 1024
            const height = 768

            const initResult = rl.initWindow(width, height, 'Dimensions Test')
            expect(initResult.isOk()).toBe(true)

            expect(rl.width).toBe(width)
            expect(rl.height).toBe(height)
        })
    })

    describe('Window Lifecycle', () => {
        test('should handle multiple init/close cycles', () => {
            // First cycle
            let initResult = rl.initWindow(800, 600, 'Cycle 1')
            expect(initResult.isOk()).toBe(true)
            expect(rl.initialized).toBe(true)

            let closeResult = rl.closeWindow()
            expect(closeResult.isOk()).toBe(true)
            expect(rl.initialized).toBe(false)

            // Second cycle
            initResult = rl.initWindow(1024, 768, 'Cycle 2')
            expect(initResult.isOk()).toBe(true)
            expect(rl.initialized).toBe(true)

            closeResult = rl.closeWindow()
            expect(closeResult.isOk()).toBe(true)
            expect(rl.initialized).toBe(false)
        })

        test('should handle close on uninitialized window gracefully', () => {
            const result = rl.closeWindow()
            expect(result.isOk()).toBe(true) // Should not error
            expect(rl.initialized).toBe(false)
        })
    })
})
