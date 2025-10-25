# UI Components System

A simple, extensible UI component system for Raylib-JS with built-in components for common UI elements.

## Features

- **Component-based architecture** - Easy to extend and customize
- **Event-driven** - Callbacks for user interactions
- **Styleable** - Customize colors, sizes, and appearance
- **State management** - Automatic hover, press, and focus states
- **Composable** - Nest components inside panels

## Available Components

### Button
Interactive button with click events.

```typescript
import { Button, Colors } from "raylib-js";

const button = new Button(100, 100, 200, 50, "Click Me!");

button.setOnClick(() => {
  console.log("Button clicked!");
});

// Custom styling
button.setStyle({
  normalColor: Colors.BLUE,
  hoverColor: Colors.DARKBLUE,
  pressedColor: Colors.SKYBLUE,
  textColor: Colors.WHITE,
  fontSize: 24,
});

// In your game loop
button.update(rl);
button.draw(rl);
```

### Slider
Draggable slider for numeric values.

```typescript
import { Slider } from "raylib-js";

const slider = new Slider(100, 100, 300, 0, 100, 50);

slider.setOnChange((value) => {
  console.log("Value:", value);
});

// Get current value
const currentValue = slider.getValue();

// Set value programmatically
slider.setValue(75);

// In your game loop
slider.update(rl);
slider.draw(rl);
```

### Checkbox
Toggle checkbox with label.

```typescript
import { Checkbox } from "raylib-js";

const checkbox = new Checkbox(100, 100, "Enable Sound", true);

checkbox.setOnChange((checked) => {
  console.log("Checked:", checked);
});

// Check state
if (checkbox.isChecked()) {
  // Do something
}

// Toggle programmatically
checkbox.toggle();

// In your game loop
checkbox.update(rl);
checkbox.draw(rl);
```

### Label
Static or dynamic text display.

```typescript
import { Label, Colors } from "raylib-js";

const label = new Label(100, 100, "Score: 0", {
  fontSize: 24,
  textColor: Colors.BLACK,
  backgroundColor: Colors.WHITE, // Optional
});

// Update text
label.setText("Score: 100");

// In your game loop
label.draw(rl);
```

### Panel
Container for grouping components.

```typescript
import { Panel, Button, Label } from "raylib-js";

const panel = new Panel(50, 50, 400, 300, "Settings");

const button = new Button(70, 100, 150, 40, "Apply");
const label = new Label(70, 150, "Volume");

panel.addChild(button);
panel.addChild(label);

// In your game loop
panel.update(rl); // Updates all children
panel.draw(rl);   // Draws all children
```

## Creating Custom Components

Extend the `UIComponent` base class:

```typescript
import { UIComponent } from "raylib-js";
import type Raylib from "raylib-js";
import type { RaylibResult } from "raylib-js";

export class CustomWidget extends UIComponent {
  constructor(x: number, y: number, width: number, height: number) {
    super(x, y, width, height);
  }

  public update(rl: Raylib): void {
    // Update component state
    this.updateState(rl);
    
    // Custom update logic
    if (this.state.isPressed) {
      // Handle press
    }
  }

  public draw(rl: Raylib): RaylibResult<void> {
    if (!this.visible) return new Ok(undefined);
    
    // Custom drawing logic
    return rl.drawRectangleRec(this.bounds, Colors.BLUE);
  }
}
```

## Component State

All components have access to these states:

- `isHovered` - Mouse is over the component
- `isPressed` - Mouse button is down while hovering
- `isFocused` - Component has keyboard focus (future feature)
- `isDisabled` - Component is disabled

```typescript
// Disable a component
button.setDisabled(true);

// Hide a component
button.setVisible(false);

// Check state
if (button.isDisabled()) {
  // Component is disabled
}
```

## Styling

Each component has a default style that can be customized:

```typescript
import { Button, DefaultButtonStyle } from "raylib-js";

// Use default style
const button1 = new Button(100, 100, 200, 50, "Default");

// Partial style override
const button2 = new Button(100, 160, 200, 50, "Custom", {
  normalColor: Colors.GREEN,
  hoverColor: Colors.DARKGREEN,
});

// Update style after creation
button1.setStyle({
  fontSize: 28,
  borderWidth: 4,
});
```

## Examples

See the examples directory:
- `examples/15-ui-components.ts` - Comprehensive demo of all components
- `examples/16-simple-ui.ts` - Minimal button example

Run examples:
```bash
bun examples/15-ui-components.ts
bun examples/16-simple-ui.ts
```

## Best Practices

1. **Update before draw** - Always call `update()` before `draw()`
2. **Use panels for organization** - Group related components in panels
3. **Handle errors** - Check `RaylibResult` return values from `draw()`
4. **Reuse styles** - Create style objects for consistent theming
5. **Disable when needed** - Use `setDisabled()` instead of hiding components

## Future Enhancements

Planned features:
- Text input field
- Dropdown menu
- Radio button group
- Progress bar
- Tooltip system
- Keyboard navigation
- Layout managers (grid, flex)
- Animation support
- Theme system
