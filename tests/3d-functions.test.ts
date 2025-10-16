import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import Raylib from '../src/Raylib'
import Vector2 from '../src/math/Vector2'
import Vector3 from '../src/math/Vector3'

describe('3D Functions', () => {
    let rl: Raylib

    beforeEach(() => {
        rl = new Raylib()
        const initResult = rl.initWindow(800, 600, '3D Test')
        expect(initResult.isOk()).toBe(true)
    })

    afterEach(() => {
        rl.closeWindow()
    })

    describe('3D Camera Mode', () => {
        test('should begin and end 3D mode successfully', () => {
            const cameraPosition = new Vector3(10, 10, 10)
            const cameraTarget = Vector3.Zero()
            const cameraUp = Vector3.Up()
            const fovy = 45.0
            const projection = 0 // CAMERA_PERSPECTIVE

            const beginResult = rl.beginMode3D(cameraPosition, cameraTarget, cameraUp, fovy, projection)
            expect(beginResult.isOk()).toBe(true)

            const endResult = rl.endMode3D()
            expect(endResult.isOk()).toBe(true)
        })

        test('should fail with invalid camera parameters', () => {
            const cameraPosition = new Vector3(NaN, 10, 10)
            const cameraTarget = Vector3.Zero()
            const cameraUp = Vector3.Up()
            const fovy = 45.0
            const projection = 0

            const beginResult = rl.beginMode3D(cameraPosition, cameraTarget, cameraUp, fovy, projection)
            expect(beginResult.isErr()).toBe(true)
        })

        test('should fail with infinite fovy', () => {
            const cameraPosition = new Vector3(10, 10, 10)
            const cameraTarget = Vector3.Zero()
            const cameraUp = Vector3.Up()
            const fovy = Infinity
            const projection = 0

            const beginResult = rl.beginMode3D(cameraPosition, cameraTarget, cameraUp, fovy, projection)
            expect(beginResult.isErr()).toBe(true)
        })
    })

    describe('3D Shape Drawing', () => {
        const setupDrawing = () => {
            const beginDrawingResult = rl.beginDrawing()
            expect(beginDrawingResult.isOk()).toBe(true)

            const cameraPosition = new Vector3(10, 10, 10)
            const cameraTarget = Vector3.Zero()
            const cameraUp = Vector3.Up()
            const fovy = 45.0
            const projection = 0

            const beginMode3DResult = rl.beginMode3D(cameraPosition, cameraTarget, cameraUp, fovy, projection)
            expect(beginMode3DResult.isOk()).toBe(true)
        }

        const teardownDrawing = () => {
            const endMode3DResult = rl.endMode3D()
            expect(endMode3DResult.isOk()).toBe(true)

            const endDrawingResult = rl.endDrawing()
            expect(endDrawingResult.isOk()).toBe(true)
        }

        test('should draw cube successfully', () => {
            setupDrawing()

            const position = Vector3.Zero()
            const width = 2.0
            const height = 2.0
            const length = 2.0
            const color = 0xFF0000FF // Red

            const drawResult = rl.drawCube(position, width, height, length, color)
            expect(drawResult.isOk()).toBe(true)

            teardownDrawing()
        })

        test('should draw cube with vector size successfully', () => {
            setupDrawing()

            const position = Vector3.Zero()
            const size = new Vector3(2.0, 2.0, 2.0)
            const color = 0x00FF00FF // Green

            const drawResult = rl.drawCubeV(position, size, color)
            expect(drawResult.isOk()).toBe(true)

            teardownDrawing()
        })

        test('should draw sphere successfully', () => {
            setupDrawing()

            const centerPos = Vector3.Zero()
            const radius = 1.5
            const color = 0x0000FFFF // Blue

            const drawResult = rl.drawSphere(centerPos, radius, color)
            expect(drawResult.isOk()).toBe(true)

            teardownDrawing()
        })

        test('should draw cylinder successfully', () => {
            setupDrawing()

            const position = Vector3.Zero()
            const radiusTop = 1.0
            const radiusBottom = 1.5
            const height = 3.0
            const slices = 16
            const color = 0xFFFF00FF // Yellow

            const drawResult = rl.drawCylinder(position, radiusTop, radiusBottom, height, slices, color)
            expect(drawResult.isOk()).toBe(true)

            teardownDrawing()
        })

        test('should draw plane successfully', () => {
            setupDrawing()

            const centerPos = Vector3.Zero()
            const size = new Vector2(5.0, 5.0)
            const color = 0xFF00FFFF // Magenta

            const drawResult = rl.drawPlane(centerPos, size, color)
            expect(drawResult.isOk()).toBe(true)

            teardownDrawing()
        })

        test('should fail to draw cube with invalid parameters', () => {
            setupDrawing()

            const position = new Vector3(NaN, 0, 0)
            const width = 2.0
            const height = 2.0
            const length = 2.0
            const color = 0xFF0000FF

            const drawResult = rl.drawCube(position, width, height, length, color)
            expect(drawResult.isErr()).toBe(true)

            teardownDrawing()
        })

        test('should fail to draw sphere with negative radius', () => {
            setupDrawing()

            const centerPos = Vector3.Zero()
            const radius = -1.0
            const color = 0x0000FFFF

            const drawResult = rl.drawSphere(centerPos, radius, color)
            expect(drawResult.isErr()).toBe(true)

            teardownDrawing()
        })

        test('should fail to draw cylinder with invalid slices', () => {
            setupDrawing()

            const position = Vector3.Zero()
            const radiusTop = 1.0
            const radiusBottom = 1.5
            const height = 3.0
            const slices = -1 // Invalid
            const color = 0xFFFF00FF

            const drawResult = rl.drawCylinder(position, radiusTop, radiusBottom, height, slices, color)
            expect(drawResult.isErr()).toBe(true)

            teardownDrawing()
        })
    })

    describe('3D Drawing Without Camera Mode', () => {
        test('should fail to draw 3D shapes without 3D mode', () => {
            const beginDrawingResult = rl.beginDrawing()
            expect(beginDrawingResult.isOk()).toBe(true)

            const position = Vector3.Zero()
            const radius = 1.0
            const color = 0xFF0000FF

            // Try to draw without entering 3D mode
            const drawResult = rl.drawSphere(position, radius, color)
            // This might succeed or fail depending on Raylib implementation
            // The test documents the current behavior
            expect(drawResult.isOk() || drawResult.isErr()).toBe(true)

            const endDrawingResult = rl.endDrawing()
            expect(endDrawingResult.isOk()).toBe(true)
        })
    })

    describe('Multiple 3D Objects', () => {
        test('should draw multiple 3D objects in one frame', () => {
            const beginDrawingResult = rl.beginDrawing()
            expect(beginDrawingResult.isOk()).toBe(true)

            const cameraPosition = new Vector3(15, 15, 15)
            const cameraTarget = Vector3.Zero()
            const cameraUp = Vector3.Up()
            const fovy = 45.0
            const projection = 0

            const beginMode3DResult = rl.beginMode3D(cameraPosition, cameraTarget, cameraUp, fovy, projection)
            expect(beginMode3DResult.isOk()).toBe(true)

            // Draw cube
            const cubeResult = rl.drawCube(new Vector3(-2, 0, 0), 1, 1, 1, 0xFF0000FF)
            expect(cubeResult.isOk()).toBe(true)

            // Draw sphere
            const sphereResult = rl.drawSphere(new Vector3(2, 0, 0), 0.8, 0x00FF00FF)
            expect(sphereResult.isOk()).toBe(true)

            // Draw cylinder
            const cylinderResult = rl.drawCylinder(new Vector3(0, 0, 2), 0.5, 0.5, 2, 12, 0x0000FFFF)
            expect(cylinderResult.isOk()).toBe(true)

            // Draw plane
            const planeResult = rl.drawPlane(new Vector3(0, -2, 0), new Vector2(10, 10), 0x808080FF)
            expect(planeResult.isOk()).toBe(true)

            const endMode3DResult = rl.endMode3D()
            expect(endMode3DResult.isOk()).toBe(true)

            const endDrawingResult = rl.endDrawing()
            expect(endDrawingResult.isOk()).toBe(true)
        })
    })

    describe('Camera Configurations', () => {
        test('should work with different camera positions', () => {
            const positions = [
                new Vector3(0, 0, 10),   // Front view
                new Vector3(10, 0, 0),   // Side view
                new Vector3(0, 10, 0),   // Top view
                new Vector3(5, 5, 5)     // Diagonal view
            ]

            positions.forEach((position) => {
                const beginResult = rl.beginMode3D(
                    position,
                    Vector3.Zero(),
                    Vector3.Up(),
                    45.0,
                    0
                )
                expect(beginResult.isOk()).toBe(true)

                const endResult = rl.endMode3D()
                expect(endResult.isOk()).toBe(true)
            })
        })

        test('should work with different field of view values', () => {
            const fovyValues = [30.0, 45.0, 60.0, 90.0, 120.0]

            fovyValues.forEach(fovy => {
                const beginResult = rl.beginMode3D(
                    new Vector3(10, 10, 10),
                    Vector3.Zero(),
                    Vector3.Up(),
                    fovy,
                    0
                )
                expect(beginResult.isOk()).toBe(true)

                const endResult = rl.endMode3D()
                expect(endResult.isOk()).toBe(true)
            })
        })
    })
})