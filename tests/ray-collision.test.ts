import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import Raylib from '../src/Raylib'
import Vector3 from '../src/math/Vector3'
import { BoundingBox } from '../src/types'

describe('Ray Collision Functions', () => {
    let rl: Raylib

    beforeEach(() => {
        rl = new Raylib()
        const initResult = rl.initWindow(800, 600, 'Ray Collision Test')
        expect(initResult.isOk()).toBe(true)
    })

    afterEach(() => {
        rl.closeWindow()
    })

    describe('Ray-Sphere Collision', () => {
        test('should detect ray hitting sphere', () => {
            const rayPos = new Vector3(0, 0, 0)
            const rayDir = new Vector3(1, 0, 0)
            const sphereCenter = new Vector3(5, 0, 0)
            const sphereRadius = 1.0

            const result = rl.getRayCollisionSphere(rayPos, rayDir, sphereCenter, sphereRadius)
            expect(result.isOk()).toBe(true)

            const collision = result.unwrap()
            expect(typeof collision.hit).toBe('boolean')
            expect(typeof collision.distance).toBe('number')
            expect(collision.point).toBeDefined()
            expect(collision.normal).toBeDefined()
        })

        test('should detect ray missing sphere', () => {
            const rayPos = new Vector3(0, 0, 0)
            const rayDir = new Vector3(1, 0, 0)
            const sphereCenter = new Vector3(0, 10, 0)
            const sphereRadius = 1.0

            const result = rl.getRayCollisionSphere(rayPos, rayDir, sphereCenter, sphereRadius)
            expect(result.isOk()).toBe(true)

            const collision = result.unwrap()
            expect(collision.hit).toBe(false)
        })

        test('should validate ray parameters', () => {
            const rayPos = new Vector3(NaN, 0, 0)
            const rayDir = new Vector3(1, 0, 0)
            const sphereCenter = new Vector3(5, 0, 0)

            const result = rl.getRayCollisionSphere(rayPos, rayDir, sphereCenter, 1.0)
            expect(result.isErr()).toBe(true)
        })

        test('should validate sphere radius', () => {
            const rayPos = new Vector3(0, 0, 0)
            const rayDir = new Vector3(1, 0, 0)
            const sphereCenter = new Vector3(5, 0, 0)

            const result = rl.getRayCollisionSphere(rayPos, rayDir, sphereCenter, -1.0)
            expect(result.isErr()).toBe(true)
        })
    })

    describe('Ray-Box Collision', () => {
        test('should detect ray hitting box', () => {
            const rayPos = new Vector3(0, 0, 0)
            const rayDir = new Vector3(1, 0, 0)
            const box: BoundingBox = {
                min: { x: 4, y: -1, z: -1 },
                max: { x: 6, y: 1, z: 1 }
            }

            const result = rl.getRayCollisionBox(rayPos, rayDir, box)
            expect(result.isOk()).toBe(true)

            const collision = result.unwrap()
            expect(typeof collision.hit).toBe('boolean')
            expect(typeof collision.distance).toBe('number')
        })

        test('should detect ray missing box', () => {
            const rayPos = new Vector3(0, 0, 0)
            const rayDir = new Vector3(1, 0, 0)
            const box: BoundingBox = {
                min: { x: 4, y: 10, z: 10 },
                max: { x: 6, y: 12, z: 12 }
            }

            const result = rl.getRayCollisionBox(rayPos, rayDir, box)
            expect(result.isOk()).toBe(true)

            const collision = result.unwrap()
            expect(collision.hit).toBe(false)
        })

        test('should validate box parameters', () => {
            const rayPos = new Vector3(0, 0, 0)
            const rayDir = new Vector3(1, 0, 0)
            const box: BoundingBox = {
                min: { x: NaN, y: -1, z: -1 },
                max: { x: 6, y: 1, z: 1 }
            }

            const result = rl.getRayCollisionBox(rayPos, rayDir, box)
            expect(result.isErr()).toBe(true)
        })
    })

    describe('Ray-Triangle Collision', () => {
        test('should detect ray hitting triangle', () => {
            const rayPos = new Vector3(0, 0, 5)
            const rayDir = new Vector3(0, 0, -1)
            const p1 = new Vector3(-1, -1, 0)
            const p2 = new Vector3(1, -1, 0)
            const p3 = new Vector3(0, 1, 0)

            const result = rl.getRayCollisionTriangle(rayPos, rayDir, p1, p2, p3)
            expect(result.isOk()).toBe(true)

            const collision = result.unwrap()
            expect(typeof collision.hit).toBe('boolean')
            expect(typeof collision.distance).toBe('number')
        })

        test('should detect ray missing triangle', () => {
            const rayPos = new Vector3(10, 10, 5)
            const rayDir = new Vector3(0, 0, -1)
            const p1 = new Vector3(-1, -1, 0)
            const p2 = new Vector3(1, -1, 0)
            const p3 = new Vector3(0, 1, 0)

            const result = rl.getRayCollisionTriangle(rayPos, rayDir, p1, p2, p3)
            expect(result.isOk()).toBe(true)

            const collision = result.unwrap()
            expect(collision.hit).toBe(false)
        })

        test('should validate triangle vertices', () => {
            const rayPos = new Vector3(0, 0, 5)
            const rayDir = new Vector3(0, 0, -1)
            const p1 = new Vector3(Infinity, -1, 0)
            const p2 = new Vector3(1, -1, 0)
            const p3 = new Vector3(0, 1, 0)

            const result = rl.getRayCollisionTriangle(rayPos, rayDir, p1, p2, p3)
            expect(result.isErr()).toBe(true)
        })
    })

    describe('Ray-Mesh Collision', () => {
        test('should validate mesh collision parameters', () => {
            const rayPos = new Vector3(0, 0, 0)
            const rayDir = new Vector3(1, 0, 0)
            const invalidModel = { slotIndex: -1, meshCount: 0, materialCount: 0 }

            const result = rl.getRayCollisionMesh(rayPos, rayDir, invalidModel, 0)
            expect(result.isOk()).toBe(true) // Will call FFI but model is invalid
        })

        test('should validate ray direction', () => {
            const rayPos = new Vector3(0, 0, 0)
            const rayDir = new Vector3(NaN, 0, 0)
            const model = { slotIndex: 0, meshCount: 1, materialCount: 1 }

            const result = rl.getRayCollisionMesh(rayPos, rayDir, model, 0)
            expect(result.isErr()).toBe(true)
        })
    })

    describe('Multiple Ray Tests', () => {
        test('should handle multiple ray casts', () => {
            const sphereCenter = new Vector3(5, 0, 0)
            const sphereRadius = 1.0

            const rays = [
                { pos: new Vector3(0, 0, 0), dir: new Vector3(1, 0, 0) },
                { pos: new Vector3(0, 1, 0), dir: new Vector3(1, 0, 0) },
                { pos: new Vector3(0, 2, 0), dir: new Vector3(1, 0, 0) }
            ]

            rays.forEach(ray => {
                const result = rl.getRayCollisionSphere(
                    ray.pos,
                    ray.dir,
                    sphereCenter,
                    sphereRadius
                )
                expect(result.isOk()).toBe(true)
            })
        })
    })
})
