// Пример 7: Полная демонстрация всех возможностей
import { Raylib, Colors, Vector2, Rectangle, kb, mouse } from '../src/index'

const rl = new Raylib()

// Инициализация окна
const initResult = rl.initWindow(1200, 800, "Raylib - Full demostration")
if (initResult.isErr()) {
    console.error("Init error:", initResult.error)
    process.exit(1)
}

rl.setTargetFPS(60)

// Игровые объекты
interface GameObject {
    pos: Vector2
    vel: Vector2
    size: number
    color: number
    type: 'circle' | 'rect'
    active: boolean
}

let player = new Rectangle(100, 100, 40, 40)
let gameObjects: GameObject[] = []
let particles: Array<{pos: Vector2, vel: Vector2, life: number, color: number}> = []

// Загрузка текстуры
let textureSlot = -1
const loadResult = rl.loadTexture("./assets/textures/texture.jpg")
if (loadResult.isOk()) {
    textureSlot = loadResult.value
}

// Создание render texture
let renderTextureSlot = -1
const rtResult = rl.loadRenderTexture(300, 200)
if (rtResult.isOk()) {
    renderTextureSlot = rtResult.value
}

// Создание игровых объектов
for (let i = 0; i < 15; i++) {
    gameObjects.push({
        pos: new Vector2(Math.random() * 1100 + 50, Math.random() * 700 + 50),
        vel: new Vector2((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100),
        size: Math.random() * 30 + 10,
        color: [Colors.RED, Colors.GREEN, Colors.BLUE, Colors.YELLOW, Colors.PURPLE, Colors.ORANGE][Math.floor(Math.random() * 6)] || Colors.RED,
        type: Math.random() > 0.5 ? 'circle' : 'rect',
        active: true
    })
}

// Игровые переменные
let score = 0
let time = 0
let gameMode = 0 // 0 - обычный, 1 - коллизии, 2 - текстуры
const gameModes = ["Regular", "Collisions", "Textures"]
let showParticles = true
let showUI = true

// Основной игровой цикл
while (true) {
    const shouldClose = rl.windowShouldClose().unwrap()
    if (shouldClose) break

    const deltaTime = rl.getFrameTime().unwrap()
    time += deltaTime
    
    // Управление игроком
    const speed = 300
    if (rl.isKeyDown(kb.KEY_W).unwrap()) player.y -= speed * deltaTime
    if (rl.isKeyDown(kb.KEY_S).unwrap()) player.y += speed * deltaTime
    if (rl.isKeyDown(kb.KEY_A).unwrap()) player.x -= speed * deltaTime
    if (rl.isKeyDown(kb.KEY_D).unwrap()) player.x += speed * deltaTime
    
    // Ограничение игрока
    if (player.x < 0) player.x = 0
    if (player.x > 1200 - player.width) player.x = 1200 - player.width
    if (player.y < 0) player.y = 0
    if (player.y > 800 - player.height) player.y = 800 - player.height
    
    // Переключение режимов
    if (rl.getKeyPressed().unwrap() === kb.KEY_SPACE) {
        gameMode = (gameMode + 1) % 3
    }
    
    // Переключение эффектов
    if (rl.getKeyPressed().unwrap() === kb.KEY_P) showParticles = !showParticles
    if (rl.getKeyPressed().unwrap() === kb.KEY_U) showUI = !showUI
    
    // Обновление игровых объектов
    for (let obj of gameObjects) {
        if (!obj.active) continue
        
        // Движение
        obj.pos.x += obj.vel.x * deltaTime
        obj.pos.y += obj.vel.y * deltaTime
        
        // Отскок от границ
        if (obj.pos.x <= 0 || obj.pos.x >= 1200) obj.vel.x *= -1
        if (obj.pos.y <= 0 || obj.pos.y >= 800) obj.vel.y *= -1
        
        // Ограничение позиции
        obj.pos.x = Math.max(0, Math.min(1200, obj.pos.x))
        obj.pos.y = Math.max(0, Math.min(800, obj.pos.y))
        
        // Проверка коллизий с игроком в режиме коллизий
        if (gameMode === 1) {
            let collision = false
            
            if (obj.type === 'circle') {
                const objCenter = new Vector2(obj.pos.x, obj.pos.y)
                collision = rl.checkCollisionCircleRec(objCenter, obj.size/2, player).unwrap()
            } else {
                const objRect = new Rectangle(obj.pos.x - obj.size/2, obj.pos.y - obj.size/2, obj.size, obj.size)
                collision = rl.checkCollisionRecs(player, objRect).unwrap()
            }
            
            if (collision) {
                obj.active = false
                score += 10
                
                // Создание частиц
                if (showParticles) {
                    for (let i = 0; i < 10; i++) {
                        particles.push({
                            pos: new Vector2(obj.pos.x, obj.pos.y),
                            vel: new Vector2((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200),
                            life: 1.0,
                            color: obj.color
                        })
                    }
                }
            }
        }
    }
    
    // Обновление частиц
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i]
        if (particle) {
            particle.pos.x += particle.vel.x * deltaTime
            particle.pos.y += particle.vel.y * deltaTime
            particle.life -= deltaTime * 2
            
            if (particle.life <= 0) {
                particles.splice(i, 1)
            }
        }
    }
    
    // Получение позиции мыши
    const mousePos = rl.getMousePosition().unwrap()
    const mouseClicked = rl.isMouseButtonDown(mouse.MOUSE_BUTTON_LEFT).unwrap()
    
    // Рисование
    rl.beginDrawing()
    rl.clearBackground(Colors.RAYWHITE)
    
    // Заголовок
    rl.drawText("Raylib - Full demonstration", 450, 10, 24, Colors.BLACK)
    
    // Режим игры
    rl.drawText(`Mode: ${gameModes[gameMode]}`, 20, 50, 18, Colors.DARKGRAY)
    rl.drawText("SPACE - change mode", 20, 75, 14, Colors.GRAY)
    
    // Рисование в зависимости от режима
    switch (gameMode) {
        case 0: // Обычный режим - все фигуры
            // Различные фигуры
            rl.drawRectangle(900, 100, 100, 60, Colors.RED)
            rl.drawCircle(1000, 200, 40, Colors.BLUE)
            
            const tri1 = new Vector2(950, 300)
            const tri2 = new Vector2(920, 360)
            const tri3 = new Vector2(980, 360)
            rl.drawTriangle(tri1, tri2, tri3, Colors.GREEN)
            
            // Линии и пиксели
            rl.drawLine(900, 400, 1100, 450, Colors.PURPLE)
            for (let i = 0; i < 20; i++) {
                rl.drawPixel(900 + i * 10, 500 + Math.sin(time + i) * 20, Colors.ORANGE)
            }
            
            rl.drawText("Shapes showcase", 920, 550, 16, Colors.BLACK)
            break
            
        case 1: // Режим коллизий
            rl.drawText(`Scoe: ${score}`, 20, 100, 18, Colors.BLACK)
            rl.drawText("Collect objects!", 20, 125, 14, Colors.DARKGRAY)
            break
            
        case 2: // Режим текстур
            if (textureSlot >= 0) {
                // Рисование текстур с различными эффектами
                rl.drawTextureFromSlot(textureSlot, 900, 100, Colors.WHITE)
                rl.drawTextureFromSlot(textureSlot, 900, 200, Colors.RED)
                rl.drawTextureFromSlot(textureSlot, 900, 300, Colors.GREEN)
                rl.drawTextureFromSlot(textureSlot, 900, 400, Colors.BLUE)
                
                // Анимированная текстура
                const animPos = new Vector2(1000 + Math.sin(time) * 50, 500)
                if (textureSlot >= 0) {
                    const textureResult = rl.getTextureFromSlot(textureSlot)
                    if (textureResult.isOk()) {
                        const texture = textureResult.value
                        const origin = new Vector2(texture.width / 2, texture.height / 2)
                        rl.drawTextureProFromSlot(textureSlot, animPos.x, animPos.y, origin.x, origin.y, time * 45, 1.0, Colors.WHITE)
                    }
                }
                
                rl.drawText("Textures showcase", 920, 600, 16, Colors.BLACK)
            } else {
                rl.drawText("texture was not loaded", 900, 300, 18, Colors.RED)
            }
            break
    }
    
    // Рисование игровых объектов
    for (const obj of gameObjects) {
        if (!obj.active) continue
        
        if (obj.type === 'circle') {
            rl.drawCircleV(obj.pos, obj.size/2, obj.color)
        } else {
            rl.drawRectangle(obj.pos.x - obj.size/2, obj.pos.y - obj.size/2, obj.size, obj.size, obj.color)
        }
    }
    
    // Рисование частиц
    if (showParticles) {
        for (const particle of particles) {
            const alpha = Math.floor(particle.life * 255)
            const color = particle.color // В реальной реализации нужно было бы изменить альфа-канал
            rl.drawCircleV(particle.pos, 2, color)
        }
    }
    
    // Рисование игрока
    const playerColor = mouseClicked ? Colors.YELLOW : Colors.BLUE
    rl.drawRectangleRec(player, playerColor)
    
    // Линия от игрока к мыши
    const playerCenter = new Vector2(player.x + player.width/2, player.y + player.height/2)
    rl.drawLineV(playerCenter, mousePos, Colors.GREEN)
    
    // Курсор мыши
    rl.drawCircleV(mousePos, 5, Colors.RED)
    
    // Render texture демонстрация
    if (renderTextureSlot >= 0) {
        // Область render texture
        rl.drawRectangle(500, 600, 304, 154, Colors.BLACK)
        rl.drawRectangle(502, 602, 300, 150, Colors.WHITE)
        
        // Мини-версия игры в render texture
        const rtScale = 0.25
        const rtOffset = new Vector2(502, 602)
        
        // Мини игрок
        const miniPlayer = new Rectangle(
            rtOffset.x + player.x * rtScale,
            rtOffset.y + player.y * rtScale,
            player.width * rtScale,
            player.height * rtScale
        )
        rl.drawRectangleRec(miniPlayer, Colors.BLUE)
        
        // Мини объекты
        for (const obj of gameObjects) {
            if (!obj.active) continue
            
            const miniPos = new Vector2(
                rtOffset.x + obj.pos.x * rtScale,
                rtOffset.y + obj.pos.y * rtScale
            )
            const miniSize = obj.size * rtScale
            
            if (obj.type === 'circle') {
                rl.drawCircleV(miniPos, miniSize/2, obj.color)
            } else {
                rl.drawRectangle(miniPos.x - miniSize/2, miniPos.y - miniSize/2, miniSize, miniSize, obj.color)
            }
        }
        
        rl.drawText("Render Texture", 520, 760, 14, Colors.BLACK)
    }
    
    // UI
    if (showUI) {
        // Информационная панель
        rl.drawRectangle(20, 150, 250, 200, Colors.BLACK)
        rl.drawRectangle(22, 152, 246, 196, Colors.WHITE)
        
        let yPos = 160
        rl.drawText("Information:", 30, yPos, 16, Colors.BLACK)
        yPos += 25
        
        rl.drawText(`FPS: ${deltaTime > 0 ? Math.floor(1/deltaTime) : 0}`, 30, yPos, 14, Colors.DARKGRAY)
        yPos += 20
        
        rl.drawText(`Time: ${time.toFixed(1)}с`, 30, yPos, 14, Colors.DARKGRAY)
        yPos += 20
        
        rl.drawText(`Objects: ${gameObjects.filter(o => o.active).length}`, 30, yPos, 14, Colors.DARKGRAY)
        yPos += 20
        
        rl.drawText(`Particles: ${particles.length}`, 30, yPos, 14, Colors.DARKGRAY)
        yPos += 20
        
        rl.drawText(`Mouse: (${Math.floor(mousePos.x)}, ${Math.floor(mousePos.y)})`, 30, yPos, 14, Colors.DARKGRAY)
        yPos += 20
        
        rl.drawText(`Player: (${Math.floor(player.x)}, ${Math.floor(player.y)})`, 30, yPos, 14, Colors.DARKGRAY)
        
        // Управление
        rl.drawText("Movement:", 30, 370, 16, Colors.BLACK)
        rl.drawText("WASD - move", 30, 395, 12, Colors.DARKGRAY)
        rl.drawText("SPACE - mode", 30, 410, 12, Colors.DARKGRAY)
        rl.drawText("P - particles", 30, 425, 12, Colors.DARKGRAY)
        rl.drawText("U - UI", 30, 440, 12, Colors.DARKGRAY)
        rl.drawText("ESC - exit", 30, 455, 12, Colors.DARKGRAY)
    }
    
    // Различные размеры текста
    rl.drawText("Small", 300, 50, 10, Colors.GRAY)
    rl.drawText("Medium", 380, 50, 16, Colors.DARKGRAY)
    rl.drawText("Big", 450, 50, 22, Colors.BLACK)
    
    rl.drawFPS(10, 10)
    rl.endDrawing()
}

// Очистка ресурсов
if (textureSlot >= 0) {
    rl.unloadTextureFromSlot(textureSlot)
}
if (renderTextureSlot >= 0) {
    rl.unloadRenderTextureFromSlot(renderTextureSlot)
}

rl.closeWindow()