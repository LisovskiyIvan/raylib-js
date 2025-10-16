import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import Raylib from '../src/Raylib'
import Vector2 from '../src/math/Vector2'
import Rectangle from '../src/math/Rectangle'
import { Colors } from '../src/constants'

describe('2D Drawing Functions', () => {
    let rl: Raylib

    beforeEach(() => {
        rl = new Raylib()
        const initResult = rl.initWindow(800, 600, '2D Drawing Test')
        expect(initResult.isOk()).toBe(true)
    })

    afterEach(() => {
        rl.closeWindow()
    })

    describe('Pixel Drawing', () => {
        test('should draw pixel with coordinates', () => {
            const beginResult = rl.beginDrawing()
            expect(beginResult.isOk()).toBe(true)

            const drawResult = rl.drawPixel(100, 100, Colors.RED)
            expect(drawResult.isOk()).toBe(true)

            const endResult = rl.endDrawing()
            expect(endResult.isOk()).toBe(true)
        })

        test('should draw pixel with vector', () => {
            const beginResult = rl.beginDrawing()
            expect(beginResult.isOk()).toBe(true)

            const position = new Vector2(150, 150)
            const drawResult = rl.drawPixelV(position, Colors.BLUE)
            expect(drawResult.isOk()).toBe(true)

            const endResult = rl.endDrawing()
            expect(endResult.isOk()).toBe(true)
        })

        test('should validate pixel color', () => {
            const beginResult = rl.beginDrawing()
            expect(beginResult.isOk()).toBe(true)

            const drawResult = rl.drawPixel(100, 100, -1)
            expect(drawResult.isErr()).toBe(true)

            rl.endDrawing()
        })
    })

    describe('Line Drawing', () => {
        test('should draw line with coordinates', () => {
            const beginResult = rl.beginDrawing()
            expect(beginResult.isOk()).toBe(true)

            const drawResult = rl.drawLine(10, 10, 100, 100, Colors.GREEN)
            expect(drawResult.isOk()).toBe(true)

            const endResult = rl.endDrawing()
            expect(endResult.isOk()).toBe(true)
        })

        test('should draw line with vectors', () => {
            const beginResult = rl.beginDrawing()
            expect(beginResult.isOk()).toBe(true)

            const start = new Vector2(20, 20)
            const end = new Vector2(200, 200)
            const drawResult = rl.drawLineV(start, end, Colors.YELLOW)
            expect(drawResult.isOk()).toBe(true)

            const endResult = rl.endDrawing()
            expect(endResult.isOk()).toBe(true)
        })

        test('should validate line color', () => {
            const beginResult = rl.beginDrawing()
            expect(beginResult.isOk()).toBe(true)

            const drawResult = rl.drawLine(0, 0, 100, 100, 0xFFFFFFFF + 1)
            expect(drawResult.isErr()).toBe(true)

            rl.endDrawing()
        })
    })

    describe('Circle Drawing', () => {
        test('should draw circle with coordinates', () => {
            const beginResult = rl.beginDrawing()
            expect(beginResult.isOk()).toBe(true)

            const drawResult = rl.drawCircle(400, 300, 50, Colors.PURPLE)
            expect(drawResult.isOk()).toBe(true)

            const endResult = rl.endDrawing()
            expect(endResult.isOk()).toBe(true)
        })

        test('should draw circle with vector', () => {
            const beginResult = rl.beginDrawing()
            expect(beginResult.isOk()).toBe(true)

            const center = new Vector2(400, 300)
            const drawResult = rl.drawCircleV(center, 75, Colors.ORANGE)
            expect(drawResult.isOk()).toBe(true)

            const endResult = rl.endDrawing()
            expect(endResult.isOk()).toBe(true)
        })

        test('should validate circle color', () => {
            const beginResult = rl.beginDrawing()
            expect(beginResult.isOk()).toBe(true)

            const drawResult = rl.drawCircle(100, 100, 50, -100)
            expect(drawResult.isErr()).toBe(true)

            rl.endDrawing()
        })
    })

    describe('Triangle Drawing', () => {
        test('should draw triangle', () => {
            const beginResult = rl.beginDrawing()
            expect(beginResult.isOk()).toBe(true)

            const v1 = new Vector2(400, 100)
            const v2 = new Vector2(300, 300)
            const v3 = new Vector2(500, 300)
            const drawResult = rl.drawTriangle(v1, v2, v3, Colors.CYAN)
            expect(drawResult.isOk()).toBe(true)

            const endResult = rl.endDrawing()
            expect(endResult.isOk()).toBe(true)
        })

        test('should validate triangle vertices', () => {
            const beginResult = rl.beginDrawing()
            expect(beginResult.isOk()).toBe(true)

            const v1 = new Vector2(NaN, 100)
            const v2 = new Vector2(300, 300)
            const v3 = new Vector2(500, 300)
            const drawResult = rl.drawTriangle(v1, v2, v3, Colors.RED)
            expect(drawResult.isErr()).toBe(true)

            rl.endDrawing()
        })
    })

    describe('Rectangle Drawing', () => {
        test('should draw rectangle with Rectangle object', () => {
            const beginResult = rl.beginDrawing()
            expect(beginResult.isOk()).toBe(true)

            const rect = new Rectangle(100, 100, 200, 150)
            const drawResult = rl.drawRectangleRec(rect, Colors.MAGENTA)
            expect(drawResult.isOk()).toBe(true)

            const endResult = rl.endDrawing()
            expect(endResult.isOk()).toBe(true)
        })

        test('should draw rectangle with rotation', () => {
            const beginResult = rl.beginDrawing()
            expect(beginResult.isOk()).toBe(true)

            const rect = new Rectangle(400, 300, 100, 80)
            const origin = new Vector2(50, 40)
            const rotation = 45
            const drawResult = rl.drawRectanglePro(rect, origin, rotation, Colors.LIME)
            expect(drawResult.isOk()).toBe(true)

            const endResult = rl.endDrawing()
            expect(endResult.isOk()).toBe(true)
        })

        test('should validate rectangle dimensions', () => {
            const beginResult = rl.beginDrawing()
            expect(beginResult.isOk()).toBe(true)

            const rect = new Rectangle(100, 100, -50, 100)
            const drawResult = rl.drawRectangleRec(rect, Colors.RED)
            expect(drawResult.isErr()).toBe(true)

            rl.endDrawing()
        })

        test('should validate rotation parameters', () => {
            const beginResult = rl.beginDrawing()
            expect(beginResult.isOk()).toBe(true)

            const rect = new Rectangle(100, 100, 50, 50)
            const origin = new Vector2(25, 25)
            const drawResult = rl.drawRectanglePro(rect, origin, NaN, Colors.RED)
            expect(drawResult.isErr()).toBe(true)

            rl.endDrawing()
        })
    })

    describe('Drawing Without Begin/End', () => {
        test('should work with proper begin/end sequence', () => {
            const beginResult = rl.beginDrawing()
            expect(beginResult.isOk()).toBe(true)

            const clearResult = rl.clearBackground(Colors.BLACK)
            expect(clearResult.isOk()).toBe(true)

            const pixelResult = rl.drawPixel(10, 10, Colors.WHITE)
            expect(pixelResult.isOk()).toBe(true)

            const lineResult = rl.drawLine(0, 0, 100, 100, Colors.RED)
            expect(lineResult.isOk()).toBe(true)

            const circleResult = rl.drawCircle(200, 200, 30, Colors.BLUE)
            expect(circleResult.isOk()).toBe(true)

            const endResult = rl.endDrawing()
            expect(endResult.isOk()).toBe(true)
        })
    })

    describe('Multiple Shapes in One Frame', () => {
        test('should draw multiple different shapes', () => {
            const beginResult = rl.beginDrawing()
            expect(beginResult.isOk()).toBe(true)

            rl.clearBackground(Colors.RAYWHITE)

            // Draw pixels
            for (let i = 0; i < 10; i++) {
                const result = rl.drawPixel(i * 10, 10, Colors.RED)
                expect(result.isOk()).toBe(true)
            }

            // Draw lines
            const lineResult = rl.drawLine(0, 50, 800, 50, Colors.GREEN)
            expect(lineResult.isOk()).toBe(true)

            // Draw circles
            const circleResult = rl.drawCircle(100, 150, 40, Colors.BLUE)
            expect(circleResult.isOk()).toBe(true)

            // Draw rectangles
            const rectResult = rl.drawRectangle(200, 100, 100, 80, Colors.YELLOW)
            expect(rectResult.isOk()).toBe(true)

            // Draw triangle
            const triangleResult = rl.drawTriangle(
                new Vector2(400, 100),
                new Vector2(350, 200),
                new Vector2(450, 200),
                Colors.PURPLE
            )
            expect(triangleResult.isOk()).toBe(true)

            const endResult = rl.endDrawing()
            expect(endResult.isOk()).toBe(true)
        })
    })
})
