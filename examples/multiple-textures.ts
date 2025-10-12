import Raylib from '../src/Raylib'
import { Colors } from '../src/constants'

const rl = new Raylib()

// Initialize window
const initResult = rl.initWindow(800, 600, "Multiple Textures Test")
if (initResult.isErr()) {
    console.error("Failed to initialize window:", initResult.unwrap())
    process.exit(1)
}

rl.setTargetFPS(60)

// Load multiple textures using Raylib API
const textureSlots: number[] = []

// Попробуем загрузить несколько текстур
const textureFiles = [
    "assets/textures/texture.jpg",
    // Можно добавить больше файлов если есть
]

for (const file of textureFiles) {
    const slotResult = rl.loadTexture(file)
    if (slotResult.isOk()) {
        const slotIndex = slotResult.unwrap()
        textureSlots.push(slotIndex)
        console.log(`✅ Loaded texture ${file} to slot ${slotIndex}`)
        
        // Получаем информацию о текстуре
        const textureResult = rl.getTextureFromSlot(slotIndex)
        if (textureResult.isOk()) {
            const texture = textureResult.unwrap()
            console.log(`   Size: ${texture.width}x${texture.height}, ID: ${texture.id}`)
        }
    } else {
        console.error(`❌ Failed to load texture ${file}:`, slotResult.unwrap())
    }
}

console.log(`Total loaded textures: ${textureSlots.length}`)

// Main game loop
let rotation = 0
while (true) {
    const shouldClose = rl.windowShouldClose()
    if (shouldClose.isErr() || shouldClose.unwrap()) {
        break
    }

    rotation += 1

    // Begin drawing
    rl.beginDrawing()
    rl.clearBackground(0x181818FF) // Dark gray background

    // Draw all loaded textures using Raylib API
    textureSlots.forEach((slotIndex, i) => {
        const x = 100 + (i * 200)
        const y = 100
        
        // Обычное рисование
        const drawResult = rl.drawTextureFromSlot(slotIndex, x, y, Colors.WHITE)
        if (drawResult.isErr()) {
            console.error(`Failed to draw texture from slot ${slotIndex}:`, drawResult.unwrap())
        }
        
        // Рисование с поворотом и масштабом
        const drawProResult = rl.drawTextureProFromSlot(
            slotIndex,
            x, y + 200,     // position
            50, 50,         // origin
            rotation,       // rotation
            0.5,           // scale
            Colors.WHITE   // tint
        )
        if (drawProResult.isErr()) {
            console.error(`Failed to draw texture pro from slot ${slotIndex}:`, drawProResult.unwrap())
        }
    })

    // Draw info
    rl.drawText("Multiple Textures Test", 10, 10, 20, Colors.WHITE)
    rl.drawText(`Loaded textures: ${textureSlots.length}`, 10, 40, 16, Colors.WHITE)
    rl.drawText("Press ESC to exit", 10, 70, 16, Colors.WHITE)

    // Show texture count from wrapper
    const countResult = rl.getLoadedTextureCount()
    if (countResult.isOk()) {
        const loadedCount = countResult.unwrap()
        rl.drawText(`Wrapper texture count: ${loadedCount}`, 10, 100, 16, Colors.YELLOW)
    }

    rl.endDrawing()
}

// Cleanup - unload all textures using Raylib API
textureSlots.forEach(slotIndex => {
    const unloadResult = rl.unloadTextureFromSlot(slotIndex)
    if (unloadResult.isOk()) {
        console.log(`🗑️ Unloaded texture from slot ${slotIndex}`)
    } else {
        console.error(`Failed to unload texture from slot ${slotIndex}:`, unloadResult.unwrap())
    }
})

// Or use unloadAllTextures() for convenience
// const unloadAllResult = rl.unloadAllTextures()
// if (unloadAllResult.isOk()) {
//     console.log("🗑️ Unloaded all textures")
// }

rl.closeWindow()