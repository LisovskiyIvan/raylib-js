# Raylib TypeScript Examples

Эта папка содержит примеры использования Raylib TypeScript wrapper с Rust-style обработкой ошибок.

## Примеры

### 1. Basic Example (`basic.ts`)

Простейший пример инициализации окна и отображения текста.

```bash
bun run example:basic
```

**Демонстрирует:**

- Базовую инициализацию Raylib
- Простой игровой цикл
- Rust-style обработку ошибок с `match()`

### 2. Advanced Example (`example.ts`)

Расширенный пример с различными стратегиями обработки ошибок.

```bash
bun run example:advanced
```

**Демонстрирует:**

- Функциональную композицию операций
- Различные стратегии обработки ошибок
- Утилиты для безопасных игровых циклов
- Множественные примеры использования API

### 3. Shapes Example (`shapes.ts`)

Пример рисования различных фигур с использованием утилит Result.

```bash
bun run example:shapes
```

**Демонстрирует:**

- Использование `collectResults()` для группировки операций
- Рисование множественных фигур
- Обработку ошибок при рендеринге

### 4. Mouse Input Example (`mouse-input.ts`)

Интерактивный пример работы с мышью.

```bash
bun run example:mouse
```

**Демонстрирует:**

- Получение позиции мыши через Result API
- Вычисление дельты движения мыши
- Интерактивную графику
- Обработку пользовательского ввода

## Общие паттерны

### Инициализация

```typescript
const rl = new Raylib();
const result = rl
  .initWindow(800, 450, "My Game")
  .andThen(() => rl.setTargetFPS(60));
```

### Игровой цикл

```typescript
while (true) {
  const shouldClose = rl.windowShouldClose().unwrapOr(true);
  if (shouldClose) break;

  rl.beginDrawing()
    .andThen(() => rl.clearBackground(Colors.WHITE))
    .andThen(() => rl.drawText("Hello!", 100, 100, 20, Colors.BLACK))
    .andThen(() => rl.endDrawing())
    .match(
      () => {}, // Success
      (error) => console.error("Error:", error.message)
    );
}
```

### Обработка ошибок

```typescript
result.match(
  () => console.log("Success!"),
  (error) => {
    console.error(`Error: [${error.kind}] ${error.message}`);
    if (error.context) console.error(`Context: ${error.context}`);
  }
);
```

## Запуск всех примеров

```bash
# Базовый пример
bun run example:basic

# Продвинутый пример
bun run example:advanced

# Пример с фигурами
bun run example:shapes

# Пример с мышью
bun run example:mouse
```

## Требования

- Bun runtime
- Raylib библиотека
- Дисплей для графического вывода
