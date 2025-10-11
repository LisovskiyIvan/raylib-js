import { dlopen, FFIType, suffix } from 'bun:ffi';

const symbolsDefinition = {
  InitWindow: {
    args: [FFIType.i32, FFIType.i32, FFIType.ptr],
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
    args: [FFIType.ptr, FFIType.i32, FFIType.i32, FFIType.i32, FFIType.u32],
    returns: FFIType.void
  },
  DrawRectangle: {
    args: [FFIType.i32, FFIType.i32, FFIType.i32, FFIType.i32, FFIType.u32],
    returns: FFIType.void
  },
  SetTargetFPS: {
    args: [FFIType.i32],
    returns: FFIType.void
  },
  DrawFPS: {
    args: [FFIType.i32, FFIType.i32],
    returns: FFIType.void
  },
  GetFrameTime: {
    args: [],
    returns: FFIType.f32
  },
  IsKeyDown: {
    args: [FFIType.i16],
    returns: FFIType.bool
  },
  IsKeyUp: {
    args: [FFIType.i16],
    returns: FFIType.bool
  },
  GetKeyPressed: {
    args: [],
    returns: FFIType.i8
},
  IsMouseButtonDown: {
    args: [FFIType.i32],
    returns: FFIType.bool
  },
  IsMouseButtonUp: {
    args: [FFIType.i32],
    returns: FFIType.bool
  },
  GetMouseX: {
    args: [],
    returns: FFIType.i32
  },
  GetMouseY: {
    args: [],
    returns: FFIType.i32
  },
  SetMousePosition: {
    args: [FFIType.i32, FFIType.i32],
    returns: FFIType.void
  },
  DrawPixel: {
    args: [FFIType.i16, FFIType.i16, FFIType.u32],
    returns: FFIType.void
  },
  DrawLine: {
    args: [FFIType.i16, FFIType.i16, FFIType.i16, FFIType.i16, FFIType.u32],
    returns: FFIType.void
  }
};

export const initRaylib = (libraryPath: string) => {
  try {
    const lib = dlopen(libraryPath, symbolsDefinition);
    return lib.symbols;
  } catch (error) {
    throw new Error(
      `Failed to load Raylib library from ${libraryPath}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};
