# Raylib TypeScript Wrapper

TypeScript обертка для Raylib с использованием Bun FFI и Rust-style обработкой ошибок через Result<T, E> типы.

## Особенности

- 🦀 **Rust-style error handling** - безопасная обработка ошибок через Result<T, E> и Option<T>
- ⚡ **Bun FFI** - высокопроизводительные биндинги через Bun Foreign Function Interface
- 🎯 **Type Safety** - полная типизация всех API методов
- 🔧 **Валидация параметров** - автоматическая проверка входных данных
- 🎮 **Полный API** - поддержка рисования, ввода, коллизий, текстур и render texture
- 📦 **Менеджер текстур** - встроенная система управления текстурами
- 🧪 **Тестируемость** - покрытие тестами основного функционала

## Установка

### Требования

- [Bun](https://bun.sh/) runtime (>= 1.0.0)
- [Raylib](https://www.raylib.com/) библиотека
- C компилятор (clang на macOS, gcc на Linux)

### Установка Raylib

**macOS (Homebrew):**
```bash
brew install raylib
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt install libraylib-dev
```

**Другие системы:** См. [официальную документацию Raylib](https://github.com/raysan5/raylib#build-and-installation)

### Установка пакета

```bash
bun add raylib-ts
```

### Компиляция нативных модулей

После установки пакета автоматически запустится компиляция C модулей. Если это не произошло или raylib установлен в нестандартном месте:

```bash
# Компиляция всех модулей
bun run compile

# Или с указанием путей к raylib
export RAYLIB_INCLUDE=/path/to/raylib/include
export RAYLIB_LIB=/path/to/raylib/lib
bun run compile

# Компиляция отдельных модулей
bun run compile:textures
bun run compile:render-texture
```

**Примечание:** Нативные модули необходимы для работы с текстурами и render texture. Основной функционал (окна, рисование, ввод) работает без них.

## Быстрый старт

### Базовый пример

```typescript
import { Raylib, Colors } from "raylib-ts"

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
```

### Result API

```typescript
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
```


## API Методы

### Управление окном

- **`initWindow(width: number, height: number, title: string)`** → `Result<void>`

- **`closeWindow()`** → `Result<void>`

- **`setTargetFPS(target: number)`** → `Result<void>`

- **`drawFPS(posX: number, posY: number)`** → `Result<void>`

### Рисование

- **`beginDrawing()`** → `Result<void>`

- **`endDrawing()`** → `Result<void>`

- **`clearBackground(color: number)`** → `Result<void>`

- **`drawRectangle(posX: number, posY: number, width: number, height: number, color: number)`** → `Result<void>`

- **`drawRectangleRec(rec: Rectangle, color: number)`** → `Result<void>`

- **`drawText(text: string, posX: number, posY: number, fontSize: number, color: number)`** → `Result<void>`

- **`drawTriangle(v1: Vector2, v2: Vector2, v3: Vector2, color: number)`** → `Result<void>`

- **`drawRectanglePro(rec: Rectangle, origin: Vector2, rotation: number, color: number)`** → `Result<void>`

- **`drawTextureFromSlot(slotIndex: number, posX: number, posY: number, tint: number)`** → `Result<void>`

- **`drawTextureProFromSlot(slotIndex: number, posX: number, posY: number, originX: number, originY: number, rotation: number, scale: number, tint: number)`** → `Result<void>`

### Ввод

- **`isKeyDown(key: number)`** → `Result<boolean>`

- **`isKeyUp(key: number)`** → `Result<boolean>`

- **`getKeyPressed()`** → `Result<number>`

- **`isMouseButtonDown(button: number)`** → `Result<boolean>`

- **`getMousePosition()`** → `Result<Vector2>`

- **`getMouseDelta()`** → `Result<Vector2>`

- **`setMousePosition(x: number, y: number)`** → `Result<void>`

### Управление курсором мыши

- **`disableCursor()`** → `Result<void>` - Захватывает мышь, скрывает курсор и блокирует его в окне

- **`enableCursor()`** → `Result<void>` - Освобождает мышь и показывает курсор

- **`hideCursor()`** → `Result<void>` - Скрывает курсор мыши

- **`showCursor()`** → `Result<void>` - Показывает курсор мыши

- **`isCursorHidden()`** → `Result<boolean>` - Проверяет, скрыт ли курсор

### Коллизии

- **`checkCollisionRecs(rec1: Rectangle, rec2: Rectangle)`** → `Result<boolean>`

- **`checkCollisionCircles(center1: Vector2, radius1: number, center2: Vector2, radius2: number)`** → `Result<boolean>`

- **`checkCollisionCircleRec(center: Vector2, radius: number, rec: Rectangle)`** → `Result<boolean>`

- **`checkCollisionCircleLine(center: Vector2, radius: number, p1: Vector2, p2: Vector2)`** → `Result<boolean>`

- **`checkCollisionPointRec(point: Vector2, rec: Rectangle)`** → `Result<boolean>`

- **`checkCollisionPointCircle(point: Vector2, center: Vector2, radius: number)`** → `Result<boolean>`

- **`checkCollisionPointTriangle(point: Vector2, p1: Vector2, p2: Vector2, p3: Vector2)`** → `Result<boolean>`

### Текстуры

- **`loadTexture(fileName: string)`** → `Result<number>`

- **`getTextureFromSlot(slotIndex: number)`** → `Result<Texture2D>`

- **`unloadTextureFromSlot(slotIndex: number)`** → `Result<void>`

- **`getLoadedTextureCount()`** → `Result<number>`

- **`unloadAllTextures()`** → `Result<void>`

- **`loadRenderTexture(width: number, height: number)`** → `Result<number>`

- **`getRenderTextureFromSlot(slotIndex: number)`** → `Result<RenderTexture2D>`

- **`unloadRenderTextureFromSlot(slotIndex: number)`** → `Result<void>`

- **`getLoadedRenderTextureCount()`** → `Result<number>`

- **`unloadAllRenderTextures()`** → `Result<void>`

### 3D Модели

- **`loadModel(fileName: string)`** → `Result<Model>` - Загружает 3D модель из файла (поддерживает OBJ, GLTF, IQM и др.)
- **`unloadModel(model: Model)`** → `Result<void>` - Выгружает модель из памяти
- **`getModelBoundingBox(model: Model)`** → `Result<BoundingBox>` - Получает ограничивающий прямоугольник модели
- **`drawModel(model: Model, position: Vector3, scale: number, tint: number)`** → `Result<void>` - Рисует модель
- **`drawModelEx(model: Model, position: Vector3, rotationAxis: Vector3, rotationAngle: number, scale: Vector3, tint: number)`** → `Result<void>` - Рисует модель с расширенными параметрами
- **`drawModelWires(model: Model, position: Vector3, scale: number, tint: number)`** → `Result<void>` - Рисует каркас модели
- **`getLoadedModelCount()`** → `Result<number>` - Получает количество загруженных моделей
- **`unloadAllModels()`** → `Result<void>` - Выгружает все модели

### Прочее

- **`windowShouldClose()`** → `Result<boolean>`

- **`getFrameTime()`** → `Result<number>`


## Примеры

```bash
# Basic
bun run example:basic

# Collision detection
bun run example:collision:detection

# Mouse input
bun run example:mouse:input

# Multiple textures
bun run example:multiple:textures

# Render texture
bun run example:render:texture

# Render texture-advanced
bun run example:render:texture-advanced

# Render texture-complete
bun run example:render:texture-complete

# Shapes
bun run example:shapes

# Texture manager-demo
bun run example:texture:manager-demo

# Triangle and-rectangle-pro
bun run example:triangle:and-rectangle-pro

```


## Доступные команды

### Разработка

```bash
# Запуск в режиме разработки
bun run dev

# Сборка проекта
bun run build

```

### Тестирование

```bash
# Запуск тестов
bun run test

# Запуск тестов в watch режиме
bun run test:watch

```

### Примеры

```bash
# Базовый пример использования
bun run example:basic

# Пример рисования фигур
bun run example:shapes

# Пример работы с мышью
bun run example:mouse

# Пример захвата мыши
bun examples/10-mouse-capture.ts

# Пример работы с несколькими текстурами
bun run example:multiple-textures

# Пример менеджера текстур
bun run example:texture-manager

```

### Компиляция

```bash
# Компиляция всех нативных модулей
bun run compile

# Компиляция модулей для работы с текстурами
bun run compile:textures

```


## Структура проекта

```
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
```


## Лицензия

MIT License

## Вклад в проект

Приветствуются pull requests и issues! Перед внесением изменений:

1. Запустите тесты: `bun test`
2. Убедитесь что код проходит линтинг
3. Добавьте тесты для новой функциональности

---

*Сгенерировано автоматически с помощью `bun run scripts/generate-readme.js`*