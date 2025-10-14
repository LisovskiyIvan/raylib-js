import { describe, test, expect } from 'bun:test'
import Vector3 from '../src/math/Vector3'

describe('Vector3', () => {
    describe('Constructors and Static Methods', () => {
        test('should create vector with x, y, z values', () => {
            const v = new Vector3(1, 2, 3)
            expect(v.x).toBe(1)
            expect(v.y).toBe(2)
            expect(v.z).toBe(3)
        })

        test('should create zero vector', () => {
            const v = Vector3.Zero()
            expect(v.x).toBe(0)
            expect(v.y).toBe(0)
            expect(v.z).toBe(0)
        })

        test('should create one vector', () => {
            const v = Vector3.One()
            expect(v.x).toBe(1)
            expect(v.y).toBe(1)
            expect(v.z).toBe(1)
        })

        test('should create up vector', () => {
            const v = Vector3.Up()
            expect(v.x).toBe(0)
            expect(v.y).toBe(1)
            expect(v.z).toBe(0)
        })

        test('should create down vector', () => {
            const v = Vector3.Down()
            expect(v.x).toBe(0)
            expect(v.y).toBe(-1)
            expect(v.z).toBe(0)
        })

        test('should create left vector', () => {
            const v = Vector3.Left()
            expect(v.x).toBe(-1)
            expect(v.y).toBe(0)
            expect(v.z).toBe(0)
        })

        test('should create right vector', () => {
            const v = Vector3.Right()
            expect(v.x).toBe(1)
            expect(v.y).toBe(0)
            expect(v.z).toBe(0)
        })

        test('should create forward vector', () => {
            const v = Vector3.Forward()
            expect(v.x).toBe(0)
            expect(v.y).toBe(0)
            expect(v.z).toBe(-1)
        })

        test('should create back vector', () => {
            const v = Vector3.Back()
            expect(v.x).toBe(0)
            expect(v.y).toBe(0)
            expect(v.z).toBe(1)
        })
    })

    describe('Addition', () => {
        test('should add two vectors', () => {
            const v1 = new Vector3(1, 2, 3)
            const v2 = new Vector3(4, 5, 6)
            const result = v1.add(v2)
            
            expect(result.x).toBe(5)
            expect(result.y).toBe(7)
            expect(result.z).toBe(9)
            // Original vectors should remain unchanged
            expect(v1.x).toBe(1)
            expect(v1.y).toBe(2)
            expect(v1.z).toBe(3)
        })

        test('should add vector in place', () => {
            const v1 = new Vector3(1, 2, 3)
            const v2 = new Vector3(4, 5, 6)
            v1.addInPlace(v2)
            
            expect(v1.x).toBe(5)
            expect(v1.y).toBe(7)
            expect(v1.z).toBe(9)
        })
    })

    describe('Subtraction', () => {
        test('should subtract two vectors', () => {
            const v1 = new Vector3(7, 8, 9)
            const v2 = new Vector3(2, 3, 4)
            const result = v1.subtract(v2)
            
            expect(result.x).toBe(5)
            expect(result.y).toBe(5)
            expect(result.z).toBe(5)
            // Original vectors should remain unchanged
            expect(v1.x).toBe(7)
            expect(v1.y).toBe(8)
            expect(v1.z).toBe(9)
        })

        test('should subtract vector in place', () => {
            const v1 = new Vector3(7, 8, 9)
            const v2 = new Vector3(2, 3, 4)
            v1.subtractInPlace(v2)
            
            expect(v1.x).toBe(5)
            expect(v1.y).toBe(5)
            expect(v1.z).toBe(5)
        })
    })

    describe('Copy Operations', () => {
        test('should copy from another vector', () => {
            const v1 = new Vector3(1, 2, 3)
            const v2 = new Vector3(4, 5, 6)
            v1.copyFrom(v2)
            
            expect(v1.x).toBe(4)
            expect(v1.y).toBe(5)
            expect(v1.z).toBe(6)
            expect(v2.x).toBe(4) // Source unchanged
            expect(v2.y).toBe(5)
            expect(v2.z).toBe(6)
        })
    })

    describe('Length and Normalization', () => {
        test('should calculate vector length', () => {
            const v = new Vector3(2, 3, 6)
            expect(v.length()).toBe(7) // sqrt(4 + 9 + 36) = sqrt(49) = 7
        })

        test('should calculate zero vector length', () => {
            const v = Vector3.Zero()
            expect(v.length()).toBe(0)
        })

        test('should normalize vector', () => {
            const v = new Vector3(3, 0, 4)
            const normalized = v.normalize()
            
            expect(normalized.x).toBeCloseTo(0.6, 5)
            expect(normalized.y).toBeCloseTo(0, 5)
            expect(normalized.z).toBeCloseTo(0.8, 5)
            expect(normalized.length()).toBeCloseTo(1, 5)
            
            // Original vector unchanged
            expect(v.x).toBe(3)
            expect(v.y).toBe(0)
            expect(v.z).toBe(4)
        })

        test('should handle zero vector normalization', () => {
            const v = Vector3.Zero()
            const normalized = v.normalize()
            
            expect(normalized.x).toBe(0)
            expect(normalized.y).toBe(0)
            expect(normalized.z).toBe(0)
        })

        test('should normalize vector in place', () => {
            const v = new Vector3(3, 0, 4)
            v.normalizeInPlace()
            
            expect(v.x).toBeCloseTo(0.6, 5)
            expect(v.y).toBeCloseTo(0, 5)
            expect(v.z).toBeCloseTo(0.8, 5)
            expect(v.length()).toBeCloseTo(1, 5)
        })

        test('should handle zero vector normalization in place', () => {
            const v = Vector3.Zero()
            v.normalizeInPlace()
            
            expect(v.x).toBe(0)
            expect(v.y).toBe(0)
            expect(v.z).toBe(0)
        })
    })

    describe('Dot and Cross Products', () => {
        test('should calculate dot product', () => {
            const v1 = new Vector3(1, 2, 3)
            const v2 = new Vector3(4, 5, 6)
            const dot = v1.dot(v2)
            
            expect(dot).toBe(32) // 1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32
        })

        test('should calculate dot product with perpendicular vectors', () => {
            const v1 = new Vector3(1, 0, 0)
            const v2 = new Vector3(0, 1, 0)
            const dot = v1.dot(v2)
            
            expect(dot).toBe(0)
        })

        test('should calculate cross product', () => {
            const v1 = new Vector3(1, 0, 0)
            const v2 = new Vector3(0, 1, 0)
            const cross = v1.cross(v2)
            
            expect(cross.x).toBe(0)
            expect(cross.y).toBe(0)
            expect(cross.z).toBe(1)
        })

        test('should calculate cross product with general vectors', () => {
            const v1 = new Vector3(2, 3, 4)
            const v2 = new Vector3(5, 6, 7)
            const cross = v1.cross(v2)
            
            // i: 3*7 - 4*6 = 21 - 24 = -3
            // j: 4*5 - 2*7 = 20 - 14 = 6
            // k: 2*6 - 3*5 = 12 - 15 = -3
            expect(cross.x).toBe(-3)
            expect(cross.y).toBe(6)
            expect(cross.z).toBe(-3)
        })

        test('should calculate cross product with parallel vectors', () => {
            const v1 = new Vector3(2, 4, 6)
            const v2 = new Vector3(1, 2, 3)
            const cross = v1.cross(v2)
            
            expect(cross.x).toBe(0) // Parallel vectors have zero cross product
            expect(cross.y).toBe(0)
            expect(cross.z).toBe(0)
        })
    })

    describe('Direction Vectors Relationships', () => {
        test('should have orthogonal direction vectors', () => {
            const right = Vector3.Right()
            const up = Vector3.Up()
            const forward = Vector3.Forward()
            
            // Test orthogonality (dot product should be 0)
            expect(right.dot(up)).toBe(0)
            expect(right.dot(forward)).toBe(0)
            expect(up.dot(forward)).toBe(0)
        })

        test('should have opposite direction vectors', () => {
            expect(Vector3.Up().dot(Vector3.Down())).toBe(-1)
            expect(Vector3.Left().dot(Vector3.Right())).toBe(-1)
            expect(Vector3.Forward().dot(Vector3.Back())).toBe(-1)
        })
    })
})