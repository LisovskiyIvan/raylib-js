import Raylib from '../src/Raylib'
import { Colors } from '../src/constants'

class TextureManager {
    private rl: Raylib
    private slots: Map<string, number> = new Map()

    constructor(raylib: Raylib) {
        this.rl = raylib
    }

    loadTexture(name: string, fileName: string): boolean {
        const result = this.rl.loadTexture(fileName)
        if (result.isOk()) {
            const slotIndex = result.unwrap()
            this.slots.set(name, slotIndex)
            console.log(`✅ Loaded texture '${name}' from ${fileName} to slot ${slotIndex}`)
            return true
        } else {
            console.error(`❌ Failed to load texture '${name}':`, result.unwrap())
            return false
        }
    }

    getSlot(name: string): number | undefined {
        return this.slots.get(name)
    }

    drawTexture(name: string, x: number, y: number, tint: number = Colors.WHITE): boolean {
        const slot = this.slots.get(name)
        if (slot === undefined) {
            console.error(`Texture '${name}' not found`)
            return false
        }

        const result = this.rl.drawTextureFromSlot(slot, x, y, tint)
        return result.isOk()
    }

    drawTexturePro(name: string, x: number, y: number, originX: number, originY: number, rotation: number, scale: number, tint: number = Colors.WHITE): boolean {
        const slot = this.slots.get(name)
        if (slot === undefined) {
            console.error(`Texture '${name}' not found`)
            return false
        }

        const result = this.rl.drawTextureProFromSlot(slot, x, y, originX, originY, rotation, scale, tint)
        return result.isOk()
    }

    unloadTexture(name: string): boolean {
        const slot = this.slots.get(name)
        if (slot === undefined) {
            return false
        }

        const result = this.rl.unloadTextureFromSlot(slot)
        if (result.isOk()) {
            this.slots.delete(name)
            console.log(`🗑️ Unloaded texture '${name}' from slot ${slot}`)
            return true
        }
        return false
    }

    unloadAll(): void {
        for (const [name, slot] of this.slots) {
            this.rl.unloadTextureFromSlot(slot)
            console.log(`🗑️ Unloaded texture '${name}' from slot ${slot}`)
        }
        this.slots.clear()
    }

    getLoadedCount(): number {
        return this.slots.size
    }

    getTextureInfo(name: string) {
        const slot = this.slots.get(name)
        if (slot === undefined) {
            return null
        }

        const result = this.rl.getTextureFromSlot(slot)
        return result.isOk() ? result.unwrap() : null
    }
}

// Main demo
const rl = new Raylib()

// Initialize window
const initResult = rl.initWindow(1000, 700, "Texture Manager Demo")
if (initResult.isErr()) {
    console.error("Failed to initialize window:", initResult.unwrap())
    process.exit(1)
}

rl.setTargetFPS(60)

// Create texture manager
const textureManager = new TextureManager(rl)

// Load textures with friendly names
textureManager.loadTexture("main", "assets/textures/texture.jpg")

// You can add more textures here if you have them:
// textureManager.loadTexture("background", "assets/textures/background.png")
// textureManager.loadTexture("player", "assets/textures/player.png")

console.log(`Loaded ${textureManager.getLoadedCount()} textures`)

// Main game loop
let time = 0
while (true) {
    const shouldClose = rl.windowShouldClose()
    if (shouldClose.isErr() || shouldClose.unwrap()) {
        break
    }

    time += 0.02

    // Begin drawing
    rl.beginDrawing()
    rl.clearBackground(0x2D2D30FF) // Dark background

    // Draw textures in different ways
    const mainInfo = textureManager.getTextureInfo("main")
    if (mainInfo) {
        // Original size
        textureManager.drawTexture("main", 50, 50)
        
        // Scaled down
        textureManager.drawTexturePro("main", 300, 50, 0, 0, 0, 0.3, Colors.WHITE)
        
        // Rotating
        textureManager.drawTexturePro("main", 600, 200, mainInfo.width * 0.15, mainInfo.height * 0.15, time * 50, 0.3, Colors.WHITE)
        
        // With tint
        textureManager.drawTexturePro("main", 50, 400, 0, 0, 0, 0.4, Colors.RED)
        
        // Pulsing scale
        const pulseScale = 0.2 + Math.sin(time * 3) * 0.1
        textureManager.drawTexturePro("main", 400, 400, mainInfo.width * pulseScale, mainInfo.height * pulseScale, 0, pulseScale, Colors.BLUE)
    }

    // Draw UI
    rl.drawText("Texture Manager Demo", 10, 10, 24, Colors.WHITE)
    rl.drawText(`Loaded textures: ${textureManager.getLoadedCount()}`, 10, 40, 18, Colors.GREEN)
    
    const countResult = rl.getLoadedTextureCount()
    if (countResult.isOk()) {
        rl.drawText(`Total wrapper slots used: ${countResult.unwrap()}`, 10, 65, 18, Colors.YELLOW)
    }
    
    rl.drawText("Press ESC to exit", 10, 90, 16, Colors.GRAY)
    
    // Show texture info
    if (mainInfo) {
        rl.drawText(`Main texture: ${mainInfo.width}x${mainInfo.height} (ID: ${mainInfo.id})`, 10, 120, 14, Colors.GRAY)
    }

    rl.endDrawing()
}

// Cleanup
textureManager.unloadAll()
rl.closeWindow()