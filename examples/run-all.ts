#!/usr/bin/env bun
// Скрипт для демонстрации всех примеров
import { Colors } from '../src/index'

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
    }
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

console.log("Инструкции:")
console.log("• Выберите пример и запустите его командой выше")
console.log("• Во всех примерах ESC - выход из программы")
console.log("• FPS отображается в левом верхнем углу")
console.log()

console.log("Требования:")
console.log("• Bun установлен и настроен")
console.log("• Raylib библиотека в ./assets/raylib-5.5_macos/lib/")
console.log("• Для примера 5: файл ./assets/textures/texture.jpg")
console.log()

// Интерактивный выбор примера
const readline = require('readline')
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

rl.question('Введите номер примера для запуска (1-7) или Enter для выхода: ', (answer: string) => {
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