import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import Raylib from '../src/Raylib'
import Vector3 from '../src/math/Vector3'
import { Colors } from '../src/constants'

describe('Advanced Model Functions', () => {
    let rl: Raylib

    beforeEach(() => {
        rl = new Raylib()
        const initResult = rl.initWindow(800, 600, 'Model Advanced Test')
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

    describe('Model Drawing', () => {
        test('should validate draw model parameters', () => {
            const invalidModel = { slotIndex: 0, meshCount: 1, materialCount: 1 }
            
            setup3DMode()

            const result = rl.drawModel(
                invalidModel,
                new Vector3(NaN, 0, 0),
                1.0,
                Colors.WHITE
            )
            expect(result.isErr()).toBe(true)

            teardown3DMode()
        })

        test('should validate draw model ex parameters', () => {
            const invalidModel = { slotIndex: 0, meshCount: 1, materialCount: 1 }
            
            setup3DMode()

            const result = rl.drawModelEx(
                invalidModel,
                Vector3.Zero(),
                Vector3.Up(),
                45,
                new Vector3(Infinity, 1, 1),
                Colors.WHITE
            )
            expect(result.isErr()).toBe(true)

            teardown3DMode()
        })

        test('should validate draw model wires parameters', () => {
            const invalidModel = { slotIndex: 0, meshCount: 1, materialCount: 1 }
            
            setup3DMode()

            const result = rl.drawModelWires(
                invalidModel,
                Vector3.Zero(),
                NaN,
                Colors.WHITE
            )
            expect(result.isErr()).toBe(true)

            teardown3DMode()
        })
    })

    describe('Model Management', () => {
        test('should get loaded model count', () => {
            const result = rl.getLoadedModelCount()
            expect(result.isOk()).toBe(true)
            expect(typeof result.unwrap()).toBe('number')
        })

        test('should unload all models', () => {
            const result = rl.unloadAllModels()
            expect(result.isOk()).toBe(true)

            const count = rl.getLoadedModelCount().unwrap()
            expect(count).toBe(0)
        })
    })
})
