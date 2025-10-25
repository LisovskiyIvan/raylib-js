# UI Components System

Система UI компонентов для Raylib с расширенной поддержкой CSS-подобного стайлинга.

## Компоненты

- **Button** - Интерактивная кнопка
- **Label** - Текстовая метка
- **Panel** - Контейнер для других компонентов
- **Slider** - Ползунок для выбора значения
- **Checkbox** - Флажок

## Новая система стайлинга

### Быстрый старт

```typescript
import { Button, UIThemes } from "raylib-js";

const button = new Button(100, 100, 200, 50, "Click Me");

// Применить готовую тему
button.applyStyle(UIThemes.modern.button);

// Или настроить свой стиль
button.setStyle({
    padding: 15,
    border: { width: 2, color: Colors.BLUE, radius: 8 },
    background: { color: Colors.SKYBLUE },
    text: { fontSize: 20, color: Colors.WHITE, textAlign: "center" },
    shadow: { offsetX: 2, offsetY: 2, blur: 4, color: Colors.GRAY }
});
```

### Основные возможности

#### 1. Spacing (Отступы)
```typescript
component.setStyle({
    padding: 10,  // Одинаковый отступ со всех сторон
    margin: { top: 5, right: 10, bottom: 5, left: 10 }  // Разные отступы
});
```

#### 2. Borders (Границы)
```typescript
component.setStyle({
    border: { width: 2, color: Colors.BLACK, radius: 5 },
    borderTop: { width: 4, color: Colors.RED },  // Только верхняя граница
});
```

#### 3. Background (Фон)
```typescript
// Сплошной цвет
component.setStyle({
    background: { color: Colors.BLUE, opacity: 0.8 }
});

// Градиент
component.setStyle({
    background: {
        gradient: {
            type: "linear",
            startColor: Colors.PURPLE,
            endColor: Colors.VIOLET
        }
    }
});
```

#### 4. Text Styling (Стилизация текста)
```typescript
label.setStyle({
    text: {
        fontSize: 24,
        color: Colors.BLACK,
        textAlign: "center",  // "left" | "center" | "right"
        textDecoration: "underline"  // "none" | "underline" | "line-through"
    }
});
```

#### 5. Shadow (Тени)
```typescript
component.setStyle({
    shadow: {
        offsetX: 3,
        offsetY: 3,
        blur: 5,
        color: Colors.GRAY
    }
});
```

#### 6. Transform (Трансформации)
```typescript
component.setStyle({
    transform: {
        translateX: 10,
        translateY: 5,
        scaleX: 1.2,
        scaleY: 1.0,
        rotation: 45
    }
});
```

### Готовые темы

```typescript
import { UIThemes } from "raylib-js";

// Default theme
button.applyStyle(UIThemes.default.button);

// Dark theme
button.applyStyle(UIThemes.dark.button);
panel.applyStyle(UIThemes.dark.panel);

// Modern theme (с тенями и скругленными углами)
button.applyStyle(UIThemes.modern.button);
```

### Слияние стилей

```typescript
import { UIStyleHelper } from "raylib-js";

const baseStyle = UIThemes.modern.button;
const customStyle = {
    background: { color: Colors.ORANGE },
    text: { fontSize: 22, color: Colors.WHITE, textAlign: "center" }
};

button.applyStyle(UIStyleHelper.mergeStyles(baseStyle, customStyle));
```

### Обратная совместимость

Старый API продолжает работать:

```typescript
// Старый способ (ButtonStyle)
button.setButtonStyle({
    normalColor: Colors.BLUE,
    hoverColor: Colors.DARKBLUE,
    fontSize: 20
});

// Новый способ (UIStyleProperties)
button.setStyle({
    background: { color: Colors.BLUE },
    text: { fontSize: 20, color: Colors.WHITE, textAlign: "center" }
});
```

## Примеры

- `examples/15-ui-components.ts` - Базовые UI компоненты
- `examples/17-advanced-styling.ts` - Расширенная система стайлинга

## Документация

Подробная документация по стайлингу: [STYLING.md](./STYLING.md)

## API Reference

### UIComponent (базовый класс)

```typescript
// Управление видимостью
setVisible(visible: boolean): void
isVisible(): boolean

// Управление состоянием
setDisabled(disabled: boolean): void
isDisabled(): boolean

// Границы
setBounds(x: number, y: number, width: number, height: number): void
getBounds(): Rectangle
getComputedBounds(): Rectangle  // С учетом margin/padding

// Стилизация
setStyle(style: Partial<UIStyleProperties>): void
applyStyle(style: Partial<UIStyleProperties>): void
getStyle(): Partial<UIStyleProperties>
```

### Button

```typescript
constructor(x: number, y: number, width: number, height: number, text: string, style?: Partial<ButtonStyle>)

setText(text: string): void
setOnClick(callback: () => void): void
setButtonStyle(style: Partial<ButtonStyle>): void  // Старый API
```

### Label

```typescript
constructor(x: number, y: number, text: string, style?: Partial<LabelStyle>)

setText(text: string): void
setLabelStyle(style: Partial<LabelStyle>): void  // Старый API
```

### Panel

```typescript
constructor(x: number, y: number, width: number, height: number, title?: string, style?: Partial<PanelStyle>)

addChild(component: UIComponent): void
removeChild(component: UIComponent): void
clearChildren(): void
getChildren(): UIComponent[]
setTitle(title: string): void
setPanelStyle(style: Partial<PanelStyle>): void  // Старый API
```

## UIRenderer

Утилиты для рендеринга с расширенной стилизацией:

```typescript
// Рендеринг стилизованного прямоугольника
UIRenderer.drawStyledRectangle(rl: Raylib, bounds: Rectangle, style: Partial<UIStyleProperties>): RaylibResult<void>

// Рендеринг стилизованного текста
UIRenderer.drawStyledText(rl: Raylib, text: string, x: number, y: number, style: TextStyle): RaylibResult<void>

// Измерение текста
UIRenderer.measureText(text: string, style: TextStyle): { width: number; height: number }
```

## UIStyleHelper

Утилиты для работы со стилями:

```typescript
// Нормализация отступов
UIStyleHelper.normalizeSpacing(value: number | Spacing | undefined): Spacing

// Слияние стилей
UIStyleHelper.mergeStyles(base: Partial<UIStyleProperties>, override: Partial<UIStyleProperties>): UIStyleProperties

// Стили по умолчанию
UIStyleHelper.defaultTextStyle(): TextStyle
UIStyleHelper.defaultBorderStyle(): BorderStyle
UIStyleHelper.defaultBackgroundStyle(): BackgroundStyle

// Интерполяция цветов
UIStyleHelper.lerpColor(color1: number, color2: number, t: number): number

// Функции плавности
UIStyleHelper.applyEasing(t: number, easing: string): number
```
