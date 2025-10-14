import { describe, it, expect, beforeAll, afterAll } from 'bun:test'
import Raylib from '../src/Raylib'
import Vector3 from '../src/math/Vector3'
import { BoundingBox } from '../src/types'

describe('3D Collision Detection Functions', () => {
    let rl: Raylib

    beforeAll(() => {
        rl = new Raylib()
        const initResult = rl.initWindow(100, 100, "Test Window")
        expect(initResult.isOk()).toBe(true)
    })

    afterAll(() => {
        rl.closeWindow()
    })

    describe('checkCollisionSpheres', () => {
        it('should detect collision between overlapping spheres', () => {
            const center1 = new Vector3(0, 0, 0)
            const radius1 = 2.0
            const center2 = new Vector3(1, 0, 0)
            const radius2 = 2.0

            const result = rl.checkCollisionSpheres(center1, radius1, center2, radius2)
            expect(result.isOk()).toBe(true)
            expect(result.unwrap()).toBe(true)
        })

        it('should not detect collision between distant spheres', () => {
            const center1 = new Vector3(0, 0, 0)
            const radius1 = 1.0
            const center2 = new Vector3(10, 0, 0)
            const radius2 = 1.0

            const result = rl.checkCollisionSpheres(center1, radius1, center2, radius2)
            expect(result.isOk()).toBe(true)
            expect(result.unwrap()).toBe(false)
        })

        it('should handle touching spheres', () => {
            const center1 = new Vector3(0, 0, 0)
            const radius1 = 1.0
            const center2 = new Vector3(2, 0, 0)
            const radius2 = 1.0

            const result = rl.checkCollisionSpheres(center1, radius1, center2, radius2)
            expect(result.isOk()).toBe(true)
            // Touching spheres should be considered colliding
            expect(result.unwrap()).toBe(true)
        })
    })

    describe('checkCollisionBoxes', () => {
        it('should detect collision between overlapping boxes', () => {
            const box1: BoundingBox = {
                min: { x: -1, y: -1, z: -1 },
                max: { x: 1, y: 1, z: 1 }
            }
            const box2: BoundingBox = {
                min: { x: 0, y: 0, z: 0 },
                max: { x: 2, y: 2, z: 2 }
            }

            const result = rl.checkCollisionBoxes(box1, box2)
            expect(result.isOk()).toBe(true)
            expect(result.unwrap()).toBe(true)
        })

        it('should not detect collision between distant boxes', () => {
            const box1: BoundingBox = {
                min: { x: -1, y: -1, z: -1 },
                max: { x: 1, y: 1, z: 1 }
            }
            const box2: BoundingBox = {
                min: { x: 5, y: 5, z: 5 },
                max: { x: 7, y: 7, z: 7 }
            }

            const result = rl.checkCollisionBoxes(box1, box2)
            expect(result.isOk()).toBe(true)
            expect(result.unwrap()).toBe(false)
        })
    })

    describe('checkCollisionBoxSphere', () => {
        it('should detect collision between overlapping box and sphere', () => {
            const box: BoundingBox = {
                min: { x: -1, y: -1, z: -1 },
                max: { x: 1, y: 1, z: 1 }
            }
            const center = new Vector3(0, 0, 0)
            const radius = 1.5

            const result = rl.checkCollisionBoxSphere(box, center, radius)
            expect(result.isOk()).toBe(true)
            expect(result.unwrap()).toBe(true)
        })

        it('should not detect collision between distant box and sphere', () => {
            const box: BoundingBox = {
                min: { x: -1, y: -1, z: -1 },
                max: { x: 1, y: 1, z: 1 }
            }
            const center = new Vector3(10, 10, 10)
            const radius = 1.0

            const result = rl.checkCollisionBoxSphere(box, center, radius)
            expect(result.isOk()).toBe(true)
            expect(result.unwrap()).toBe(false)
        })
    })



    describe('validation', () => {
        it('should validate sphere parameters', () => {
            const center1 = new Vector3(0, 0, 0)
            const center2 = new Vector3(1, 1, 1)

            // Test negative radius
            const result = rl.checkCollisionSpheres(center1, -1, center2, 1)
            expect(result.isErr()).toBe(true)
        })

        it('should validate finite values', () => {
            const center1 = new Vector3(NaN, 0, 0)
            const center2 = new Vector3(1, 1, 1)

            const result = rl.checkCollisionSpheres(center1, 1, center2, 1)
            expect(result.isErr()).toBe(true)
        })
    })
})