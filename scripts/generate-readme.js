#!/usr/bin/env bun

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

/**
 * Скрипт для генерации README.md файла
 * Парсит API из исходного кода и создает структурированную документацию
 */

// Конфигурация
const CONFIG = {
  sourceFile: 'src/Raylib.ts',
  packageFile: 'package.json',
  outputFile: 'README.md',
  examplesDir: 'examples',
  testsDir: 'tests'
}

// Описание библиотеки
const LIBRARY_DESCRIPTION = `# Raylib TypeScript Wrapper

TypeScript обертка для Raylib с использованием Bun FFI и Rust-style обработкой ошибок через Result<T, E> типы.

## Особенности

- 🦀 **Rust-style error handling** - безопасная обработка ошибок через Result<T, E> и Option<T>
- ⚡ **Bun FFI** - высокопроизводительные биндинги через Bun Foreign Function Interface
- 🎯 **Type Safety** - полная типизация всех API методов
- 🔧 **Валидация параметров** - автоматическая проверка входных данных
- 🎮 **Полный API** - поддержка рисования, ввода, коллизий, текстур и render texture
- 📦 **Менеджер текстур** - встроенная система управления текстурами
- 🧪 **Тестируемость** - покрытие тестами основного функционала`

// Инструкции по установке
const INSTALLATION_INSTRUCTIONS = `## Установка

### Требования

- [Bun](https://bun.sh/) runtime
- Raylib библиотека (включена в \`assets/raylib-5.5_macos/lib/\`)
- TypeScript 5+

### Установка зависимостей

\`\`\`bash
bun install
\`\`\`

### Компиляция нативных модулей (опционально)

\`\`\`bash
# Компиляция всех модулей
bun run compile

# Компиляция только текстурных модулей
bun run compile:textures
\`\`\``

/**
 * Парсит методы из исходного кода Raylib.ts
 */
function parseApiMethods(sourceCode) {
  const methods = []
  
  // Регулярное выражение для поиска публичных методов
  const methodRegex = /public\s+(\w+)\s*\([^)]*\):\s*RaylibResult<([^>]+)>/g
  
  let match
  while ((match = methodRegex.exec(sourceCode)) !== null) {
    const [, methodName, returnType] = match
    
    // Извлекаем параметры метода
    const methodStart = sourceCode.indexOf(`public ${methodName}(`)
    const methodEnd = sourceCode.indexOf('): RaylibResult', methodStart)
    const methodSignature = sourceCode.substring(methodStart, methodEnd + 1)
    
    // Парсим параметры
    const paramsMatch = methodSignature.match(/\(([^)]*)\)/)
    const params = paramsMatch ? paramsMatch[1].split(',').map(p => p.trim()).filter(p => p) : []
    
    // Определяем категорию метода
    let category = 'Прочее'
    if (methodName.includes('Window') || methodName.includes('init') || methodName.includes('close') || methodName.includes('FPS')) {
      category = 'Управление окном'
    } else if (methodName.includes('draw') || methodName.includes('clear') || methodName.includes('Drawing')) {
      category = 'Рисование'
    } else if (methodName.includes('Key') || methodName.includes('Mouse') || methodName.includes('Input')) {
      category = 'Ввод'
    } else if (methodName.includes('Collision') || methodName.includes('check')) {
      category = 'Коллизии'
    } else if (methodName.includes('Texture') || methodName.includes('load') || methodName.includes('unload')) {
      category = 'Текстуры'
    } else if (methodName.includes('RenderTexture')) {
      category = 'Render Texture'
    }
    
    methods.push({
      name: methodName,
      params,
      returnType,
      category,
      signature: methodSignature.replace('public ', '')
    })
  }
  
  return methods
}

/**
 * Группирует методы по категориям
 */
function groupMethodsByCategory(methods) {
  const grouped = {}
  
  methods.forEach(method => {
    if (!grouped[method.category]) {
      grouped[method.category] = []
    }
    grouped[method.category].push(method)
  })
  
  return grouped
}

/**
 * Генерирует документацию для методов API
 */
function generateApiDocumentation(methods) {
  const grouped = groupMethodsByCategory(methods)
  let documentation = '## API Методы\n\n'
  
  // Порядок категорий
  const categoryOrder = [
    'Управление окном',
    'Рисование', 
    'Ввод',
    'Коллизии',
    'Текстуры',
    'Render Texture',
    'Прочее'
  ]
  
  categoryOrder.forEach(category => {
    if (grouped[category]) {
      documentation += `### ${category}\n\n`
      
      grouped[category].forEach(method => {
        documentation += `- **\`${method.name}(${method.params.join(', ')})\`** → \`Result<${method.returnType}>\`\n`
        documentation += '\n'
      })
    }
  })
  
  return documentation
}

/**
 * Читает примеры из директории examples
 */
function getExamples() {
  try {
    const examplesPath = join(process.cwd(), CONFIG.examplesDir)
    const files = require('fs').readdirSync(examplesPath)
    
    return files
      .filter(file => file.endsWith('.ts'))
      .map(file => file.replace('.ts', ''))
      .sort()
  } catch (error) {
    console.warn('Не удалось прочитать примеры:', error.message)
    return []
  }
}

/**
 * Генерирует секцию с примерами
 */
function generateExamplesSection(examples) {
  if (examples.length === 0) {
    return '## Примеры\n\nПримеры находятся в разработке.\n\n'
  }
  
  let section = '## Примеры\n\n'
  section += '```bash\n'
  
  examples.forEach(example => {
    const scriptName = `example:${example.replace('-', ':')}`
    section += `# ${example.charAt(0).toUpperCase() + example.slice(1).replace('-', ' ')}\n`
    section += `bun run ${scriptName}\n\n`
  })
  
  section += '```\n\n'
  return section
}

/**
 * Генерирует секцию со скриптами из package.json
 */
function generateScriptsSection(packageJson) {
  const scripts = packageJson.scripts || {}
  
  let section = '## Доступные команды\n\n'
  
  // Группируем скрипты
  const groups = {
    'Разработка': ['dev', 'build'],
    'Тестирование': ['test', 'test:watch'],
    'Примеры': Object.keys(scripts).filter(key => key.startsWith('example:')),
    'Компиляция': ['compile', 'compile:textures']
  }
  
  Object.entries(groups).forEach(([groupName, scriptKeys]) => {
    const groupScripts = scriptKeys.filter(key => scripts[key])
    
    if (groupScripts.length > 0) {
      section += `### ${groupName}\n\n`
      section += '```bash\n'
      
      groupScripts.forEach(key => {
        const description = getScriptDescription(key)
        section += `# ${description}\n`
        section += `bun run ${key}\n\n`
      })
      
      section += '```\n\n'
    }
  })
  
  return section
}

/**
 * Получает описание для скрипта
 */
function getScriptDescription(scriptName) {
  const descriptions = {
    'dev': 'Запуск в режиме разработки',
    'build': 'Сборка проекта',
    'test': 'Запуск тестов',
    'test:watch': 'Запуск тестов в watch режиме',
    'compile': 'Компиляция всех нативных модулей',
    'compile:textures': 'Компиляция модулей для работы с текстурами',
    'example:basic': 'Базовый пример использования',
    'example:shapes': 'Пример рисования фигур',
    'example:mouse': 'Пример работы с мышью',
    'example:multiple-textures': 'Пример работы с несколькими текстурами',
    'example:texture-manager': 'Пример менеджера текстур'
  }
  
  return descriptions[scriptName] || scriptName.replace(':', ' ')
}

/**
 * Генерирует секцию с примером использования
 */
function generateUsageExample() {
  return `## Быстрый старт

### Базовый пример

\`\`\`typescript
import Raylib from "./src/Raylib"
import { Colors } from "./src/constants"

const rl = new Raylib()

// Rust-style error handling
const result = rl.initWindow(800, 450, 'Мое приложение')
  .andThen(() => rl.setTargetFPS(60))
  .andThen(() => {
    // Игровой цикл
    while (true) {
      const shouldClose = rl.windowShouldClose().unwrapOr(true)
      if (shouldClose) break

      rl.beginDrawing()
        .andThen(() => rl.clearBackground(Colors.WHITE))
        .andThen(() => rl.drawText("Привет, Raylib!", 190, 200, 20, Colors.BLACK))
        .andThen(() => rl.endDrawing())
        .match(
          () => {}, // Успех - продолжаем
          (error) => {
            console.error('Ошибка кадра: [' + error.kind + '] ' + error.message)
            return // Выход при ошибке
          }
        )
    }
    return rl.closeWindow()
  })

// Обработка финального результата
result.match(
  () => console.log('Программа завершена успешно!'),
  (error) => {
    console.error('Ошибка программы: [' + error.kind + '] ' + error.message)
    if (error.context) console.error('Контекст: ' + error.context)
  }
)
\`\`\`

### Result API

\`\`\`typescript
// Проверка результата
if (result.isOk()) {
  console.log('Успех:', result.value)
} else {
  console.error('Ошибка:', result.error)
}

// Pattern matching
result.match(
  (value) => console.log('Успех:', value),
  (error) => console.error('Ошибка:', error.message)
)

// Цепочка операций
result
  .andThen(value => anotherOperation(value))
  .andThen(value => yetAnotherOperation(value))
  .match(
    (finalValue) => console.log('Все операции успешны'),
    (error) => console.error('Одна из операций провалилась:', error)
  )

// Значения по умолчанию
const position = rl.getMousePosition().unwrapOr({ x: 0, y: 0 })
\`\`\`

`
}

/**
 * Генерирует структуру проекта
 */
function generateProjectStructure() {
  return `## Структура проекта

\`\`\`
src/
├── index.ts              # Основной файл приложения
├── Raylib.ts             # Основной класс с Result API
├── result.ts             # Result<T, E> и Option<T> типы
├── utils.ts              # Утилиты для работы с Result
├── raylib-ffi.ts         # FFI биндинги
├── types.ts              # TypeScript типы и ошибки
├── constants.ts          # Константы (цвета, клавиши)
├── validation.ts         # Валидация параметров
├── math/                 # Математические типы
│   ├── Vector2.ts        # 2D вектор
│   └── Rectangle.ts      # Прямоугольник
└── wrappers/             # Нативные обертки
    ├── texture-wrapper.c # Обертка для текстур
    └── render-texture-wrapper.c # Обертка для render texture

examples/
├── basic.ts              # Базовый пример
├── shapes.ts             # Пример с фигурами
├── mouse-input.ts        # Пример с мышью
├── multiple-textures.ts  # Пример с текстурами
└── texture-manager-demo.ts # Демо менеджера текстур

tests/
├── raylib.test.ts        # Тесты Raylib API
├── utils.test.ts         # Тесты утилит
├── texture.test.ts       # Тесты текстур
└── render-texture.test.ts # Тесты render texture

assets/
├── raylib-5.5_macos/     # Raylib библиотека для macOS
├── textures/             # Тестовые текстуры
├── texture-wrapper.dylib # Скомпилированная обертка текстур
└── render-texture-wrapper.dylib # Скомпилированная обертка render texture
\`\`\`

`
}

/**
 * Основная функция генерации README
 */
function generateReadme() {
  console.log('🚀 Генерация README.md...')
  
  try {
    // Читаем исходные файлы
    const sourceCode = readFileSync(CONFIG.sourceFile, 'utf-8')
    const packageJson = JSON.parse(readFileSync(CONFIG.packageFile, 'utf-8'))
    
    // Парсим API методы
    console.log('📖 Парсинг API методов...')
    const methods = parseApiMethods(sourceCode)
    console.log(`Найдено ${methods.length} методов`)
    
    // Получаем примеры
    console.log('📁 Сканирование примеров...')
    const examples = getExamples()
    console.log(`Найдено ${examples.length} примеров`)
    
    // Генерируем секции README
    console.log('📝 Генерация документации...')
    
    const readmeContent = [
      LIBRARY_DESCRIPTION,
      '',
      INSTALLATION_INSTRUCTIONS,
      '',
      generateUsageExample(),
      generateApiDocumentation(methods),
      generateExamplesSection(examples),
      generateScriptsSection(packageJson),
      generateProjectStructure(),
      '## Лицензия',
      '',
      'MIT License',
      '',
      '## Вклад в проект',
      '',
      'Приветствуются pull requests и issues! Перед внесением изменений:',
      '',
      '1. Запустите тесты: \`bun test\`',
      '2. Убедитесь что код проходит линтинг',
      '3. Добавьте тесты для новой функциональности',
      '',
      '---',
      '',
      '*Сгенерировано автоматически с помощью \`bun run scripts/generate-readme.js\`*'
    ].join('\n')
    
    // Записываем README
    writeFileSync(CONFIG.outputFile, readmeContent, 'utf-8')
    
    console.log(`✅ README.md успешно сгенерирован! (${readmeContent.length} символов)`)
    console.log(`📊 Статистика:`)
    console.log(`   - API методов: ${methods.length}`)
    console.log(`   - Примеров: ${examples.length}`)
    console.log(`   - Скриптов: ${Object.keys(packageJson.scripts || {}).length}`)
    
  } catch (error) {
    console.error('❌ Ошибка при генерации README:', error.message)
    process.exit(1)
  }
}

// Запуск скрипта
if (import.meta.main) {
  generateReadme()
}

export { generateReadme }