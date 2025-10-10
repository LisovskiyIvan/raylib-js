# Raylib TypeScript Tests

Эта папка содержит тесты для Raylib TypeScript wrapper с Rust-style Result API.

## Структура тестов

### 1. Raylib API Tests (`raylib.test.ts`)
Тесты основного Raylib класса и Result API.

**Покрывает:**
- Валидацию параметров
- Проверку состояния инициализации
- Цепочки операций с `andThen()`
- Методы `match()`, `unwrapOr()`, `map()`
- Обработку различных типов ошибок

### 2. Utils Tests (`utils.test.ts`)
Тесты утилитарных функций для работы с Result.

**Покрывает:**
- `collectResults()` - сбор массива результатов
- `sequence()` - последовательное выполнение операций
- `retry()` - повторные попытки с backoff
- `logResult()` - логирование результатов

## Запуск тестов

```bash
# Запустить все тесты
bun test

# Запустить тесты в watch режиме
bun run test:watch

# Запустить конкретный тест файл
bun test tests/raylib.test.ts
bun test tests/utils.test.ts
```

## Типы тестов

### Валидационные тесты
Проверяют корректность валидации входных параметров:

```typescript
test("should return validation errors", () => {
  const rl = new Raylib();
  const result = rl.initWindow(-1, 100, "Test");
  
  expect(result.isErr()).toBe(true);
  if (result.isErr()) {
    expect(result.error.kind).toBe(RaylibErrorKind.ValidationError);
  }
});
```

### Тесты состояния
Проверяют правильность управления состоянием:

```typescript
test("should require initialization", () => {
  const rl = new Raylib();
  const result = rl.beginDrawing();
  
  expect(result.isErr()).toBe(true);
  if (result.isErr()) {
    expect(result.error.kind).toBe(RaylibErrorKind.StateError);
  }
});
```

### Функциональные тесты
Проверяют работу Result API методов:

```typescript
test("should chain operations with andThen", () => {
  const rl = new Raylib();
  const result = rl.initWindow(-1, 100, "Test")
    .andThen(() => rl.setTargetFPS(60));
  
  expect(result.isErr()).toBe(true);
});
```

### Утилитарные тесты
Проверяют работу вспомогательных функций:

```typescript
test("collectResults - should collect all successful results", () => {
  const results = [ok(1), ok(2), ok(3)];
  const collected = collectResults(results);
  
  expect(collected.isOk()).toBe(true);
  if (collected.isOk()) {
    expect(collected.value).toEqual([1, 2, 3]);
  }
});
```

## Особенности тестирования

### Headless Environment
Некоторые тесты могут не работать в headless окружении (без дисплея). В таких случаях тесты автоматически пропускаются с соответствующим сообщением.

### Error Handling
Все тесты используют Rust-style обработку ошибок и проверяют как успешные, так и ошибочные сценарии.

### Type Safety
Тесты проверяют типобезопасность Result API, включая правильную работу type guards (`isOk()`, `isErr()`).

## Статистика тестов

Текущее покрытие:
- ✅ 18 тестов проходят
- ✅ 52 проверки (expect calls)
- ✅ Покрытие основных API методов
- ✅ Покрытие утилитарных функций
- ✅ Покрытие обработки ошибок