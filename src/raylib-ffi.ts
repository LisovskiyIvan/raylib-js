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
  DisableCursor: {
    args: [],
    returns: FFIType.void
  },
  EnableCursor: {
    args: [],
    returns: FFIType.void
  },
  HideCursor: {
    args: [],
    returns: FFIType.void
  },
  ShowCursor: {
    args: [],
    returns: FFIType.void
  },
  IsCursorHidden: {
    args: [],
    returns: FFIType.bool
  },
  DrawPixel: {
    args: [FFIType.i16, FFIType.i16, FFIType.u32],
    returns: FFIType.void
  },
  DrawLine: {
    args: [FFIType.i16, FFIType.i16, FFIType.i16, FFIType.i16, FFIType.u32],
    returns: FFIType.void
  },
  DrawCircle: {
    args: [FFIType.i16, FFIType.i16, FFIType.f32, FFIType.u32],
    returns: FFIType.void
  },
  DrawTriangle: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.u32],
    returns: FFIType.void
  },
  DrawRectanglePro: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.u32],
    returns: FFIType.void
  },
  CheckCollisionRecs: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32],
    returns: FFIType.bool
  },
  CheckCollisionCircles: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32],
    returns: FFIType.bool
  },
  CheckCollisionCircleRec: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32],
    returns: FFIType.bool
  },
  CheckCollisionCircleLine: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32],
    returns: FFIType.bool
  },
  CheckCollisionPointRec: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32],
    returns: FFIType.bool
  },
  CheckCollisionPointCircle: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32],
    returns: FFIType.bool
  },
  CheckCollisionPointTriangle: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32],
    returns: FFIType.bool
  },
  // 3D Drawing functions
  DrawLine3D: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.u32],
    returns: FFIType.void
  },
  DrawPoint3D: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.u32],
    returns: FFIType.void
  },
  DrawCircle3D: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.u32],
    returns: FFIType.void
  },
  DrawTriangle3D: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.u32],
    returns: FFIType.void
  },
  // Additional 3D shapes
  DrawCube: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.u32],
    returns: FFIType.void
  },
  DrawCubeV: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.u32],
    returns: FFIType.void
  },
  DrawSphere: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.u32],
    returns: FFIType.void
  },
  DrawCylinder: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.i32, FFIType.u32],
    returns: FFIType.void
  },
  DrawCapsule: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.i32, FFIType.i32, FFIType.u32],
    returns: FFIType.void
  },
  DrawPlane: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.u32],
    returns: FFIType.void
  },
  DrawRay: {
    args: [FFIType.ptr, FFIType.u32],
    returns: FFIType.void
  },
  DrawGrid: {
    args: [FFIType.i32, FFIType.f32],
    returns: FFIType.void
  },
  // 3D Collision detection functions
  CheckCollisionSpheres: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32],
    returns: FFIType.bool
  },
  CheckCollisionBoxes: {
    args: [FFIType.ptr, FFIType.ptr],
    returns: FFIType.bool
  },
  CheckCollisionBoxSphere: {
    args: [FFIType.ptr, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32],
    returns: FFIType.bool
  },

  // 3D Camera and mode functions - Camera3D struct should be passed as pointer
  BeginMode3D: {
    args: [FFIType.ptr],
    returns: FFIType.void
  },
  EndMode3D: {
    args: [],
    returns: FFIType.void
  },
};

const wrapperSymbols = {
  // Multiple texture management
  LoadTextureToSlot: {
    args: [FFIType.ptr],
    returns: FFIType.i32
  },
  GetTextureWidthBySlot: {
    args: [FFIType.i32],
    returns: FFIType.i32
  },
  GetTextureHeightBySlot: {
    args: [FFIType.i32],
    returns: FFIType.i32
  },
  GetTextureMipmapsBySlot: {
    args: [FFIType.i32],
    returns: FFIType.i32
  },
  GetTextureFormatBySlot: {
    args: [FFIType.i32],
    returns: FFIType.i32
  },
  GetTextureIdBySlot: {
    args: [FFIType.i32],
    returns: FFIType.u32
  },
  UnloadTextureBySlot: {
    args: [FFIType.i32],
    returns: FFIType.void
  },
  DrawTextureBySlot: {
    args: [FFIType.i32, FFIType.i32, FFIType.i32, FFIType.u32],
    returns: FFIType.void
  },
  DrawTextureProBySlot: {
    args: [FFIType.i32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.u32],
    returns: FFIType.void
  },
  GetLoadedTextureCount: {
    args: [],
    returns: FFIType.i32
  },
  UnloadAllTextures: {
    args: [],
    returns: FFIType.void
  },
};

const modelWrapperSymbols = {
  // Model management
  LoadModelToSlot: {
    args: [FFIType.ptr],
    returns: FFIType.i32
  },
  GetModelMeshCountBySlot: {
    args: [FFIType.i32],
    returns: FFIType.i32
  },
  GetModelMaterialCountBySlot: {
    args: [FFIType.i32],
    returns: FFIType.i32
  },
  GetModelBoundingBoxMinXBySlot: {
    args: [FFIType.i32],
    returns: FFIType.f32
  },
  GetModelBoundingBoxMinYBySlot: {
    args: [FFIType.i32],
    returns: FFIType.f32
  },
  GetModelBoundingBoxMinZBySlot: {
    args: [FFIType.i32],
    returns: FFIType.f32
  },
  GetModelBoundingBoxMaxXBySlot: {
    args: [FFIType.i32],
    returns: FFIType.f32
  },
  GetModelBoundingBoxMaxYBySlot: {
    args: [FFIType.i32],
    returns: FFIType.f32
  },
  GetModelBoundingBoxMaxZBySlot: {
    args: [FFIType.i32],
    returns: FFIType.f32
  },
  UnloadModelBySlot: {
    args: [FFIType.i32],
    returns: FFIType.void
  },
  DrawModelBySlot: {
    args: [FFIType.i32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.u32],
    returns: FFIType.void
  },
  DrawModelExBySlot: {
    args: [FFIType.i32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.u32],
    returns: FFIType.void
  },
  DrawModelWiresBySlot: {
    args: [FFIType.i32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.u32],
    returns: FFIType.void
  },
  GetLoadedModelCount: {
    args: [],
    returns: FFIType.i32
  },
  UnloadAllModels: {
    args: [],
    returns: FFIType.void
  },
  IsModelSlotValid: {
    args: [FFIType.i32],
    returns: FFIType.bool
  }
};

const renderTextureWrapperSymbols = {
  // Render texture management
  LoadRenderTextureToSlot: {
    args: [FFIType.i32, FFIType.i32],
    returns: FFIType.i32
  },
  GetRenderTextureIdBySlot: {
    args: [FFIType.i32],
    returns: FFIType.u32
  },
  GetRenderTextureColorIdBySlot: {
    args: [FFIType.i32],
    returns: FFIType.u32
  },
  GetRenderTextureColorWidthBySlot: {
    args: [FFIType.i32],
    returns: FFIType.i32
  },
  GetRenderTextureColorHeightBySlot: {
    args: [FFIType.i32],
    returns: FFIType.i32
  },
  GetRenderTextureColorMipmapsBySlot: {
    args: [FFIType.i32],
    returns: FFIType.i32
  },
  GetRenderTextureColorFormatBySlot: {
    args: [FFIType.i32],
    returns: FFIType.i32
  },
  GetRenderTextureDepthIdBySlot: {
    args: [FFIType.i32],
    returns: FFIType.u32
  },
  GetRenderTextureDepthWidthBySlot: {
    args: [FFIType.i32],
    returns: FFIType.i32
  },
  GetRenderTextureDepthHeightBySlot: {
    args: [FFIType.i32],
    returns: FFIType.i32
  },
  GetRenderTextureDepthMipmapsBySlot: {
    args: [FFIType.i32],
    returns: FFIType.i32
  },
  GetRenderTextureDepthFormatBySlot: {
    args: [FFIType.i32],
    returns: FFIType.i32
  },
  UnloadRenderTextureBySlot: {
    args: [FFIType.i32],
    returns: FFIType.void
  },
  GetLoadedRenderTextureCount: {
    args: [],
    returns: FFIType.i32
  },
  UnloadAllRenderTextures: {
    args: [],
    returns: FFIType.void
  },
};

const rayCollisionWrapperSymbols = {
  // Ray collision detection
  GetRayCollisionSphereWrapper: {
    args: [FFIType.ptr, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32],
    returns: FFIType.void
  },
  GetRayCollisionBoxWrapper: {
    args: [FFIType.ptr, FFIType.ptr],
    returns: FFIType.void
  },
  GetRayCollisionTriangleWrapper: {
    args: [FFIType.ptr, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32],
    returns: FFIType.void
  },
  // Getters for last collision result
  GetLastCollisionHit: {
    args: [],
    returns: FFIType.bool
  },
  GetLastCollisionDistance: {
    args: [],
    returns: FFIType.f32
  },
  GetLastCollisionPointX: {
    args: [],
    returns: FFIType.f32
  },
  GetLastCollisionPointY: {
    args: [],
    returns: FFIType.f32
  },
  GetLastCollisionPointZ: {
    args: [],
    returns: FFIType.f32
  },
  GetLastCollisionNormalX: {
    args: [],
    returns: FFIType.f32
  },
  GetLastCollisionNormalY: {
    args: [],
    returns: FFIType.f32
  },
  GetLastCollisionNormalZ: {
    args: [],
    returns: FFIType.f32
  },
};

export const initRaylib = (libraryPath: string) => {
  try {
    const lib = dlopen(libraryPath, symbolsDefinition);
    const wrapperLib = dlopen('./assets/texture-wrapper.dylib', wrapperSymbols);
    const renderTextureWrapperLib = dlopen('./assets/render-texture-wrapper.dylib', renderTextureWrapperSymbols);
    const modelWrapperLib = dlopen('./assets/model-wrapper.dylib', modelWrapperSymbols);
    const rayCollisionWrapperLib = dlopen('./assets/ray-collision-wrapper.dylib', rayCollisionWrapperSymbols);

    return {
      ...lib.symbols,
      ...wrapperLib.symbols,
      ...renderTextureWrapperLib.symbols,
      ...modelWrapperLib.symbols,
      ...rayCollisionWrapperLib.symbols
    };
  } catch (error) {
    throw new Error(
      `Failed to load Raylib library from ${libraryPath}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};
