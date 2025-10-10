// Raylib цвета в формате ABGR (little-endian)
export const Colors = {
  WHITE: 0xFFFFFFFF,     // Белый
  BLACK: 0xFF000000,     // Черный (исправлено)
  RED: 0xFF0000FF,       // Красный  
  GREEN: 0xFF00FF00,     // Зеленый (исправлено)
  BLUE: 0xFFFF0000,      // Синий (исправлено)
  YELLOW: 0xFF00FFFF,    // Желтый (исправлено)
  GRAY: 0xFF808080,      // Серый (исправлено)
  RAYWHITE: 0xFFF5F5F5,  // Raylib стандартный белый
  DARKGRAY: 0xFF505050   // Темно-серый
};
//
//  Функция для создания цвета из RGBA компонентов
export function createColor(r: number, g: number, b: number, a: number = 255): number {
  return (a << 24) | (b << 16) | (g << 8) | r;
}

// Альтернативные цвета через функцию
export const ColorsRGBA = {
  WHITE: createColor(255, 255, 255, 255),
  BLACK: createColor(0, 0, 0, 255),
  RED: createColor(255, 0, 0, 255),
  GREEN: createColor(0, 255, 0, 255),
  BLUE: createColor(0, 0, 255, 255),
  YELLOW: createColor(255, 255, 0, 255),
  GRAY: createColor(128, 128, 128, 255)
};