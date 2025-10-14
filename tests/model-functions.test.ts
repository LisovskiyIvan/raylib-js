import { describe, it, expect, beforeAll, afterAll } from 'bun:test'
import Raylib from '../src/Raylib'

describe('Model Functions', () => {
    let rl: Raylib

    beforeAll(() => {
        rl = new Raylib()
        const initResult = rl.initWindow(100, 100, "Test Window")
        expect(initResult.isOk()).toBe(true)
    })

    afterAll(() => {
        rl.closeWindow()
    })

    it('should validate fileName parameter', () => {
        const result = rl.loadModel("")
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
            expect(result.error.kind).toBe("VALIDATION_ERROR")
        }
    })

    it('should handle unloading invalid model', () => {
        const invalidModel = { slotIndex: -1, meshCount: 0, materialCount: 0 }
        const result = rl.unloadModel(invalidModel)
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
            expect(result.error.message).toContain("Invalid model slot index")
        }
    })

    it('should handle getting bounding box of invalid model', () => {
        const invalidModel = { slotIndex: -1, meshCount: 0, materialCount: 0 }
        const result = rl.getModelBoundingBox(invalidModel)
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
            expect(result.error.message).toContain("Invalid model slot index")
        }
    })

    it('should get loaded model count', () => {
        const result = rl.getLoadedModelCount()
        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
            expect(typeof result.unwrap()).toBe('number')
        }
    })

    it('should handle invalid model file gracefully', () => {
        const result = rl.loadModel("nonexistent.obj")
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
            expect(result.error.message).toContain("Failed to load model")
        }
    })


    // Note: Testing with actual model files would require having test assets
    // For now, we're testing error handling and validation
})