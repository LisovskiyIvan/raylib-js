import { describe, it, expect, beforeAll, afterAll } from 'bun:test'
import Raylib from '../src/Raylib'

describe('Render Texture Tests', () => {
    let rl: Raylib

    beforeAll(() => {
        rl = new Raylib()
        const initResult = rl.initWindow(400, 300, "Test Window")
        if (initResult.isErr()) {
            throw new Error(`Failed to initialize window: ${initResult.error.message}`)
        }
    })

    afterAll(() => {
        rl.closeWindow()
    })

    it('should load render texture successfully', () => {
        const result = rl.loadRenderTexture(200, 150)
        expect(result.isOk()).toBe(true)
        
        const slotIndex = result.unwrap()
        expect(typeof slotIndex).toBe('number')
        expect(slotIndex).toBeGreaterThanOrEqual(0)
        
        // Clean up
        rl.unloadRenderTextureFromSlot(slotIndex)
    })

    it('should get render texture details from slot', () => {
        const loadResult = rl.loadRenderTexture(100, 100)
        expect(loadResult.isOk()).toBe(true)
        
        const slotIndex = loadResult.unwrap()
        const getResult = rl.getRenderTextureFromSlot(slotIndex)
        expect(getResult.isOk()).toBe(true)
        
        const renderTexture = getResult.unwrap()
        expect(renderTexture.id).toBeGreaterThan(0)
        expect(renderTexture.texture.width).toBe(100)
        expect(renderTexture.texture.height).toBe(100)
        expect(renderTexture.depth.width).toBe(100)
        expect(renderTexture.depth.height).toBe(100)
        
        // Clean up
        rl.unloadRenderTextureFromSlot(slotIndex)
    })

    it('should track loaded render texture count', () => {
        const initialCount = rl.getLoadedRenderTextureCount().unwrap()
        
        const slot1 = rl.loadRenderTexture(50, 50).unwrap()
        expect(rl.getLoadedRenderTextureCount().unwrap()).toBe(initialCount + 1)
        
        const slot2 = rl.loadRenderTexture(75, 75).unwrap()
        expect(rl.getLoadedRenderTextureCount().unwrap()).toBe(initialCount + 2)
        
        rl.unloadRenderTextureFromSlot(slot1)
        expect(rl.getLoadedRenderTextureCount().unwrap()).toBe(initialCount + 1)
        
        rl.unloadRenderTextureFromSlot(slot2)
        expect(rl.getLoadedRenderTextureCount().unwrap()).toBe(initialCount)
    })
})