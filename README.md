# Raylib TypeScript Wrapper

TypeScript обертка для Raylib с использованием Bun FFI и Rust-style обработкой ошибок через Result<T, E> типы.

## Установка

```bash
bun install
```

## Использование

### Основной пример

```typescript
import Raylib from "./src/Raylib";
import { Colors } from "./src/constants";
import type { RaylibError } from "./src/types";

// Использование пути по умолчанию
const rl = new Raylib();

// Или указание пользовательского пути к библиотеке
// const rl = new Raylib('./path/to/your/raylib/library');

// Rust-style error handling
const result = rl.initWindow(800, 450, 'My Game')
  .andThen(() => rl.setTargetFPS(60))
  .andThen(() => {
    // Game loop
    while (true) {
      const shouldClose = rl.windowShouldClose().unwrapOr(true);
      if (shouldClose) break;

      rl.beginDrawing()
        .andThen(() => rl.clearBackground(Colors.WHITE))
        .andThen(() => rl.drawText("Hello, Raylib!", 190, 200, 20, Colors.BLACK))
        .andThen(() => rl.endDrawing())
        .match(
          () => {}, // Success - continue
          (error) => {
            console.error(`Frame error: [${error.kind}] ${error.message}`);
            return; // Exit on error
          }
        );
    }
    return rl.closeWindow();
  });

// Handle final result
result.match(
  () => console.log('Program completed successfully!'),
  (error) => {
    console.error(`Program failed: [${error.kind}] ${error.message}`);
    if (error.context) console.error(`Context: ${error.context}`);
  }
);
```

### Типы ошибок

```typescript
enum RaylibErrorKind {
  InitError = 'INIT_ERROR',        // Ошибки инициализации
  FFIError = 'FFI_ERROR',          // Ошибки FFI/библиотеки
  ValidationError = 'VALIDATION_ERROR', // Неверные параметры
  StateError = 'STATE_ERROR',      // Неверное состояние
  DrawError = 'DRAW_ERROR',        // Ошибки рисования
  InputError = 'INPUT_ERROR'       // Ошибки ввода
}
```

### Result API методы

```typescript
// Проверка результата
if (result.isOk()) {
  console.log('Success:', result.value);
} else {
  console.error('Error:', result.error);
}

// Pattern matching
result.match(
  (value) => console.log('Success:', value),
  (error) => console.error('Error:', error.message)
);

// Цепочка операций
result
  .andThen(value => anotherOperation(value))
  .andThen(value => yetAnotherOperation(value))
  .match(
    (finalValue) => console.log('All operations succeeded'),
    (error) => console.error('One operation failed:', error)
  );

// Значения по умолчанию
const position = rl.getMousePosition().unwrapOr({ x: 0, y: 0 });

// Трансформация значений
const windowInfo = rl.initWindow(800, 600, "Test")
  .map(() => ({ width: rl.width, height: rl.height }));
```

### Утилиты для работы с Result

```typescript
import { collectResults, sequence, retry, logResult } from "./src/utils";

// Выполнить несколько операций и собрать результаты
const operations = [
  () => rl.drawRectangle(0, 0, 100, 100, Colors.RED),
  () => rl.drawRectangle(100, 0, 100, 100, Colors.GREEN),
  () => rl.drawRectangle(200, 0, 100, 100, Colors.BLUE)
];

const allResults = collectResults(operations.map(op => op()));

// Последовательное выполнение с остановкой на первой ошибке
const sequenceResult = sequence(operations);

// Повторные попытки
const retryResult = retry(() => rl.initWindow(800, 600, "Test"), 3);

// Логирование результатов
const loggedResult = logResult(
  rl.drawText("Hello", 100, 100, 20, Colors.BLACK),
  "draw hello text"
);
```

## Запуск

```bash
# Основное приложение
bun run dev

# Примеры
bun run example:basic      # Базовый пример
bun run example:advanced   # Расширенный пример
bun run example:shapes     # Пример с фигурами
bun run example:mouse      # Пример с мышью

# Тесты
bun run test              # Все тесты
bun run test:watch        # Тесты в watch режиме

# Сборка
bun run build
```

## Конструктор

```typescript
// Использование пути по умолчанию (./assets/raylib-5.5_macos/lib/libraylib.dylib)
const rl = new Raylib();

// Указание пользовательского пути к библиотеке
const rl = new Raylib('./my-raylib/lib/libraylib.dylib');

// Поддерживаются различные форматы библиотек в зависимости от платформы
const rl = new Raylib('./raylib/lib/libraylib.so');    // Linux
const rl = new Raylib('./raylib/lib/libraylib.dll');   // Windows
const rl = new Raylib('./raylib/lib/libraylib.dylib'); // macOS
```

## API

### Основные методы

- `initWindow(width, height, title)` - инициализация окна
- `closeWindow()` - закрытие окна
- `windowShouldClose()` - проверка закрытия окна
- `setTargetFPS(fps)` - установка целевого FPS

### Рисование

- `beginDrawing()` / `endDrawing()` - начало/конец кадра
- `clearBackground(color)` - очистка фона
- `drawRectangle(x, y, width, height, color)` - рисование прямоугольника
- `drawRectanglePro(rectangle, origin, rotation, color)` - рисование прямоугольника с поворотом
- `drawTriangle(v1, v2, v3, color)` - рисование треугольника по трем точкам
- `drawText(text, x, y, fontSize, color)` - рисование текста
- `drawFPS(x, y)` - отображение FPS

### Обнаружение коллизий

- `checkCollisionRecs(rec1, rec2)` - проверка коллизии между двумя прямоугольниками
- `checkCollisionCircles(center1, radius1, center2, radius2)` - проверка коллизии между двумя кругами
- `checkCollisionCircleRec(center, radius, rectangle)` - проверка коллизии между кругом и прямоугольником
- `checkCollisionCircleLine(center, radius, p1, p2)` - проверка коллизии круга с линией
- `checkCollisionPointRec(point, rectangle)` - проверка нахождения точки в прямоугольнике
- `checkCollisionPointCircle(point, center, radius)` - проверка нахождения точки в круге
- `checkCollisionPointTriangle(point, p1, p2, p3)` - проверка нахождения точки в треугольнике

### Ввод

- `isKeyDown(key)` / `isKeyUp(key)` - состояние клавиш
- `getKeyPressed()` - получение нажатой клавиши
- `isMouseButtonDown(button)` - состояние кнопок мыши
- `getMousePosition()` - позиция мыши
- `getMouseDelta()` - изменение позиции мыши
- `setMousePosition(x, y)` - установка позиции мыши

### Свойства

- `initialized` - состояние инициализации
- `width` / `height` - размеры окна

## Структура проекта

```
src/
├── index.ts          # Основной файл приложения
├── Raylib.ts         # Основной класс с Result API
├── result.ts         # Result<T, E> и Option<T> типы
├── utils.ts          # Утилиты для работы с Result
├── raylib-ffi.ts     # FFI биндинги
├── types.ts          # TypeScript типы и ошибки
└── constants.ts      # Константы (цвета, клавиши)

examples/
├── README.md         # Документация примеров
├── basic.ts          # Базовый пример
├── example.ts        # Расширенный пример
├── shapes.ts         # Пример с фигурами
└── mouse-input.ts    # Пример с мышью

tests/
├── README.md         # Документация тестов
├── raylib.test.ts    # Тесты Raylib API
└── utils.test.ts     # Тесты утилит
```

## Требования

- Bun runtime
- Raylib библиотека (в папке `assets/raylib-5.5_macos/lib/`)
- TypeScript 5+