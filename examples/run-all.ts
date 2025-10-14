#!/usr/bin/env bun

const examples = [
    {
        name: "01-basic-window.ts",
        title: "Базовое окно",
        description: "Простое окно с текстом и FPS"
    },
    {
        name: "02-shapes-and-text.ts",
        title: "Фигуры и текст",
        description: "Все доступные фигуры и различные размеры текста"
    },
    {
        name: "03-input-handling.ts",
        title: "Обработка ввода",
        description: "Клавиатура и мышь, плавное движение"
    },
    {
        name: "04-collision-detection.ts",
        title: "Определение коллизий",
        description: "Коллизии между различными фигурами"
    },
    {
        name: "05-texture-loading.ts",
        title: "Загрузка текстур",
        description: "Работа с текстурами, трансформации, оттенки"
    },
    {
        name: "06-render-texture.ts",
        title: "Render Texture",
        description: "Рисование в текстуру, постобработка"
    },
    {
        name: "07-complete-demo.ts",
        title: "Полная демонстрация",
        description: "Все возможности в одном интерактивном примере"
    },
    {
        name: "08-3d-shapes.ts",
        title: "3D фигуры",
        description: "3D демонстрация с вращающейся камерой"
    },
    {
        name: "09-3d-wasd-camera.ts",
        title: "3D WASD камера",
        description: "3D сцена с управлением камерой на WASD и мышь"
    },
    {
        name: "10-model-loading.ts",
        title: "Загрузка 3D моделей",
        description: "Загрузка и отображение 3D моделей, получение bounding box"
    },
    {
        name: "11-3d-collision-detection.ts",
        title: "3D определение коллизий",
        description: "3D коллизии между сферами, боксами и лучами"
    },
    {
        name: "12-simple-3d-collisions.ts",
        title: "Простые 3D коллизии",
        description: "Базовые 3D коллизии с анимацией"
    },
]

console.log("🎮 Raylib TypeScript - Примеры")
console.log("=".repeat(50))

for (let i = 0; i < examples.length; i++) {
    const example = examples[i]
    if (!example) continue
    console.log(`${i + 1}. ${example.title}`)
    console.log(`   Файл: ${example.name}`)
    console.log(`   Описание: ${example.description}`)
    console.log(`   Запуск: bun examples/${example.name}`)
    console.log()
}

console.log("Требования:")
console.log("• Bun установлен и настроен")
console.log("• Raylib библиотека в ./assets/raylib/lib/")
console.log("• Для примера 5: файл ./assets/textures/texture.jpg")
console.log()

// Интерактивный выбор примера
const readline = require('readline')
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

rl.question(`Введите номер примера для запуска (1-${examples.length}) или Enter для выхода: `, (answer: string) => {
    const num = parseInt(answer.trim())

    if (isNaN(num) || num < 1 || num > examples.length) {
        console.log("Выход...")
        rl.close()
        return
    }

    const selectedExample = examples[num - 1]
    if (!selectedExample) return
    console.log(`\n🚀 Запуск: ${selectedExample.title}`)
    console.log(`Файл: ${selectedExample.name}`)
    console.log("Нажмите ESC в окне для выхода из примера\n")

    rl.close()

    // Запуск выбранного примера
    const { spawn } = require('child_process')
    const child = spawn('bun', [`examples/${selectedExample.name}`], {
        stdio: 'inherit'
    })

    child.on('close', (code: number) => {
        console.log(`\n✅ Пример завершен с кодом: ${code}`)
    })

    child.on('error', (error: Error) => {
        console.error(`❌ Ошибка запуска: ${error.message}`)
    })
})