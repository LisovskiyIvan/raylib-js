import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import Raylib from '../src/Raylib'
import Vector3 from '../src/math/Vector3'
import { Colors } from '../src/constants'

describe('3D Drawing Primitives', () => {
    let rl: Raylib

    beforeEach(() => {
        rl = new Raylib()
        const initResult = rl.initWindow(800, 600, '3D Drawing Test')
        expect(initResult.isOk()).toBe(true)
    })

    afterEach(() => {
        rl.closeWindow()
    })

    const setup3DMode = () => {
        rl.beginDrawing()
        rl.beginMode3D(
            new Vector3(10, 10, 10),
            Vector3.Zero(),
            Vector3.Up(),
            45.0,
            0
        )
    }

    const teardown3DMode = () => {
        rl.endMode3D()
        rl.endDrawing()
    }

    describe('3D Line Drawing', () => {
        test('should draw 3D line', () => {
            setup3DMode()

            const start = new Vector3(0, 0, 0)
            const end = new Vector3(5, 5, 5)
            const result = rl.drawLine3D(start, end, Colors.RED)
            expect(result.isOk()).toBe(true)

            teardown3DMode()
        })

        test('should validate line endpoints', () => {
            setup3DMode()

            const start = new Vector3(NaN, 0, 0)
            const end = new Vector3(5, 5, 5)
            const result = rl.drawLine3D(start, end, Colors.RED)
            expect(result.isErr()).toBe(true)

            teardown3DMode()
        })
    })

    describe('3D Point Drawing', () => {
        test('should draw 3D point', () => {
            setup3DMode()

            const position = new Vector3(2, 3, 4)
            const result = rl.drawPoint3D(position, Colors.BLUE)
            expect(result.isOk()).toBe(true)

            teardown3DMode()
        })

        test('should validate point position', () => {
            setup3DMode()

            const position = new Vector3(Infinity, 0, 0)
            const result = rl.drawPoint3D(position, Colors.BLUE)
            expect(result.isErr()).toBe(true)

            teardown3DMode()
        })
    })

    describe('3D Circle Drawing', () => {
        test('should draw 3D circle', () => {
            setup3DMode()

            const center = new Vector3(0, 0, 0)
            const radius = 2.0
            const rotationAxis = Vector3.Up()
            const rotationAngle = 0
            const result = rl.drawCircle3D(center, radius, rotationAxis, rotationAngle, Colors.GREEN)
            expect(result.isOk()).toBe(true)

            teardown3DMode()
        })

        test('should validate circle radius', () => {
            setup3DMode()

            const center = new Vector3(0, 0, 0)
            const radius = -1.0
            const rotationAxis = Vector3.Up()
            const result = rl.drawCircle3D(center, radius, rotationAxis, 0, Colors.GREEN)
            expect(result.isErr()).toBe(true)

            teardown3DMode()
        })
    })

    describe('3D Triangle Drawing', () => {
        test('should draw 3D triangle', () => {
            setup3DMode()

            const v1 = new Vector3(0, 0, 0)
            const v2 = new Vector3(2, 0, 0)
            const v3 = new Vector3(1, 2, 0)
            const result = rl.drawTriangle3D(v1, v2, v3, Colors.YELLOW)
            expect(result.isOk()).toBe(true)

            teardown3DMode()
        })
    })

    describe('Capsule Drawing', () => {
        test('should draw capsule', () => {
            setup3DMode()

            const startPos = new Vector3(0, 0, 0)
            const endPos = new Vector3(0, 3, 0)
            const radius = 0.5
            const slices = 16
            const rings = 8
            const result = rl.drawCapsule(startPos, endPos, radius, slices, rings, Colors.PURPLE)
            expect(result.isOk()).toBe(true)

            teardown3DMode()
        })

        test('should validate capsule parameters', () => {
            setup3DMode()

            const startPos = new Vector3(0, 0, 0)
            const endPos = new Vector3(0, 3, 0)
            const result = rl.drawCapsule(startPos, endPos, -1, 16, 8, Colors.PURPLE)
            expect(result.isErr()).toBe(true)

            teardown3DMode()
        })
    })

    describe('Ray Drawing', () => {
        test('should draw ray', () => {
            setup3DMode()

            const position = new Vector3(0, 0, 0)
            const direction = new Vector3(1, 0, 0)
            const result = rl.drawRay(position, direction, Colors.ORANGE)
            expect(result.isOk()).toBe(true)

            teardown3DMode()
        })
    })

    describe('Grid Drawing', () => {
        test('should draw grid', () => {
            setup3DMode()

            const result = rl.drawGrid(10, 1.0)
            expect(result.isOk()).toBe(true)

            teardown3DMode()
        })

        test('should validate grid parameters', () => {
            setup3DMode()

            const result = rl.drawGrid(-5, 1.0)
            expect(result.isErr()).toBe(true)

            teardown3DMode()
        })
    })
})
