import { dlopen, FFIType, suffix } from 'bun:ffi';

const { symbols } = dlopen(`./assets/raylib-5.5_macos/lib/libraylib.${suffix}`, {
  // Базовые функции
  InitWindow: {
    args: [FFIType.i32, FFIType.i32, FFIType.cstring],
    returns: FFIType.void
  },
  CloseWindow: {
    args: [],
    returns: FFIType.void
  },
  WindowShouldClose: {
    args: [],
    returns: FFIType.bool
  },
  BeginDrawing: {
    args: [],
    returns: FFIType.void
  },
  EndDrawing: {
    args: [],
    returns: FFIType.void
  },
  ClearBackground: {
    args: [FFIType.u32], // Color как 32-битное значение
    returns: FFIType.void
  },
  DrawText: {
    args: [FFIType.cstring, FFIType.i32, FFIType.i32, FFIType.i32, FFIType.u32],
    returns: FFIType.void
  },
  DrawRectangle: {
    args: [FFIType.i32, FFIType.i32, FFIType.i32, FFIType.i32, FFIType.u32],
    returns: FFIType.void
  },
  SetTargetFPS: {
    args: [FFIType.i32],
    returns: FFIType.void
  }
});

export default symbols;

export const Colors = {
  WHITE: 0xFFFFFFFF,   // Белый
  BLACK: 0x000000FF,   // Черный  
  RED: 0xFF0000FF,     // Красный
  GREEN: 0x00FF00FF,   // Зеленый
  BLUE: 0x0000FFFF,    // Синий
  GRAY: 0x808080FF     // Серый
};