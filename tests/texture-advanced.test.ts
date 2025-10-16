import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import Raylib from '../src/Raylib'
import { Colors } from '../src/constants'

describe('Advanced Texture Functions', () => {
    let rl: Raylib

    beforeEach(() => {
        rl = new Raylib()
        const initResult = rl.initWindow(800, 600, 'Texture Advanced Test')
        expect(initResult.isOk()).toBe(true)
    })

    afterEach(() => {
        rl.closeWindow()
    })

    describe('Texture Pro Drawing', () => {
        test('should draw texture with pro parameters', () => {
            const loadResult = rl.loadTexture('assets/textures/texture.jpg')
            expect(loadResult.isOk()).toBe(true)

            const slotIndex = loadResult.unwrap()

            rl.beginDrawing()

            const result = rl.drawTextureProFromSlot(
                slotIndex,
                400, 300,  // position
                50, 50,    // origin
                45,        // rotation
                1.5,       // scale
                Colors.WHITE
            )
            expect(result.isOk()).toBe(true)

            rl.endDrawing()

            rl.unloadTextureFromSlot(slotIndex)
        })

        test('should validate texture pro parameters', () => {
            const loadResult = rl.loadTexture('assets/textures/texture.jpg')
            expect(loadResult.isOk()).toBe(true)

            const slotIndex = loadResult.unwrap()

            rl.beginDrawing()

            const result = rl.drawTextureProFromSlot(
                slotIndex,
                NaN, 300,
                50, 50,
                45,
                1.5,
                Colors.WHITE
            )
            expect(result.isErr()).toBe(true)

            rl.endDrawing()

            rl.unloadTextureFromSlot(slotIndex)
        })
    })

    describe('Texture Management', () => {
        test('should get loaded texture count', () => {
            const initialCount = rl.getLoadedTextureCount().unwrap()

            const slot1 = rl.loadTexture('assets/textures/texture.jpg').unwrap()
            expect(rl.getLoadedTextureCount().unwrap()).toBe(initialCount + 1)

            rl.unloadTextureFromSlot(slot1)
            expect(rl.getLoadedTextureCount().unwrap()).toBe(initialCount)
        })

        test('should unload all textures', () => {
            rl.loadTexture('assets/textures/texture.jpg')
            rl.loadTexture('assets/textures/texture.jpg')

            const result = rl.unloadAllTextures()
            expect(result.isOk()).toBe(true)

            const count = rl.getLoadedTextureCount().unwrap()
            expect(count).toBe(0)
        })
    })

    describe('Render Texture Management', () => {
        test('should unload all render textures', () => {
            rl.loadRenderTexture(100, 100)
            rl.loadRenderTexture(200, 200)

            const result = rl.unloadAllRenderTextures()
            expect(result.isOk()).toBe(true)

            const count = rl.getLoadedRenderTextureCount().unwrap()
            expect(count).toBe(0)
        })
    })
})
