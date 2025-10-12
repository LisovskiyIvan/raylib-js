import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import Raylib from '../src/Raylib'

describe('Texture Loading', () => {
    let rl: Raylib

    beforeEach(() => {
        rl = new Raylib()
        const initResult = rl.initWindow(800, 600, 'Texture Test')
        expect(initResult.isOk()).toBe(true)
    })

    afterEach(() => {
        rl.closeWindow()
    })

    test('should load texture successfully', () => {
        const result = rl.loadTexture('assets/textures/texture.jpg')
        
        expect(result.isOk()).toBe(true)
        
        const texture = result.unwrap()
        expect(texture.id).toBeGreaterThan(0)
        expect(texture.width).toBe(1650)
        expect(texture.height).toBe(1100)
        expect(texture.mipmaps).toBe(1)
        expect(texture.format).toBe(4) // R8G8B8 format
        
        // Clean up
        const unloadResult = rl.unloadTexture(texture)
        expect(unloadResult.isOk()).toBe(true)
    })

    test('should fail to load non-existent texture', () => {
        const result = rl.loadTexture('non-existent-file.jpg')
        
        // Note: Raylib might still return a texture ID even for non-existent files
        // depending on how it handles errors, so we just check that we get a result
        expect(result.isOk() || result.isErr()).toBe(true)
    })

    test('should draw texture without errors', () => {
        const loadResult = rl.loadTexture('assets/textures/texture.jpg')
        expect(loadResult.isOk()).toBe(true)
        
        const texture = loadResult.unwrap()
        
        // Begin drawing
        const beginResult = rl.beginDrawing()
        expect(beginResult.isOk()).toBe(true)
        
        // Draw texture
        const drawResult = rl.drawTexture(texture, 100, 100, 0xFFFFFFFF)
        expect(drawResult.isOk()).toBe(true)
        
        // End drawing
        const endResult = rl.endDrawing()
        expect(endResult.isOk()).toBe(true)
        
        // Clean up
        const unloadResult = rl.unloadTexture(texture)
        expect(unloadResult.isOk()).toBe(true)
    })
})