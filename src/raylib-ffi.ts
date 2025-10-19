import { dlopen, FFIType } from 'bun:ffi';
import { PlatformManager, LibraryNotFoundError } from './platform/PlatformManager';
import type { PlatformInfo, LibraryPaths } from './platform/PlatformManager';

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
  DrawPoly: {
    args: [FFIType.ptr, FFIType.i32, FFIType.f32, FFIType.f32, FFIType.u32],
    returns: FFIType.void
  },
  DrawTriangleFan: {
    args: [FFIType.ptr, FFIType.i32, FFIType.u32],
    returns: FFIType.void
  },
  DrawRectanglePro: {
    args: [FFIType.ptr, FFIType.ptr, FFIType.f32, FFIType.u32],
    returns: FFIType.void
  },
  CheckCollisionRecs: {
    args: [FFIType.ptr, FFIType.ptr],
    returns: FFIType.bool
  },
  CheckCollisionCircles: {
    args: [FFIType.ptr, FFIType.f32, FFIType.ptr, FFIType.f32],
    returns: FFIType.bool
  },
  CheckCollisionCircleRec: {
    args: [FFIType.ptr, FFIType.f32, FFIType.ptr],
    returns: FFIType.bool
  },
  CheckCollisionCircleLine: {
    args: [FFIType.ptr, FFIType.f32, FFIType.ptr, FFIType.ptr],
    returns: FFIType.bool
  },
  CheckCollisionPointRec: {
    args: [FFIType.ptr, FFIType.ptr],
    returns: FFIType.bool
  },
  CheckCollisionPointCircle: {
    args: [FFIType.ptr, FFIType.ptr, FFIType.f32],
    returns: FFIType.bool
  },
  CheckCollisionPointTriangle: {
    args: [FFIType.ptr, FFIType.ptr, FFIType.ptr, FFIType.ptr],
    returns: FFIType.bool
  },
  // 3D Drawing functions
  DrawLine3D: {
    args: [FFIType.ptr, FFIType.ptr, FFIType.u32],
    returns: FFIType.void
  },
  DrawPoint3D: {
    args: [FFIType.ptr, FFIType.u32],
    returns: FFIType.void
  },
  DrawCircle3D: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.u32],
    returns: FFIType.void
  },
  DrawTriangle3D: {
    args: [FFIType.ptr, FFIType.ptr, FFIType.ptr, FFIType.u32],
    returns: FFIType.void
  },
  // Additional 3D shapes
  DrawCube: {
    args: [FFIType.ptr, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.u32],
    returns: FFIType.void
  },
  DrawCubeV: {
    args: [FFIType.ptr, FFIType.ptr, FFIType.u32],
    returns: FFIType.void
  },
  DrawSphere: {
    args: [FFIType.ptr, FFIType.f32, FFIType.u32],
    returns: FFIType.void
  },
  DrawCylinder: {
    args: [FFIType.ptr, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.i32, FFIType.u32],
    returns: FFIType.void
  },
  DrawCapsule: {
    args: [FFIType.ptr, FFIType.ptr, FFIType.f32, FFIType.i32, FFIType.i32, FFIType.u32],
    returns: FFIType.void
  },
  DrawPlane: {
    args: [FFIType.ptr, FFIType.ptr, FFIType.u32],
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
    args: [FFIType.ptr, FFIType.f32, FFIType.ptr, FFIType.f32],
    returns: FFIType.bool
  },
  CheckCollisionBoxes: {
    args: [FFIType.ptr, FFIType.ptr],
    returns: FFIType.bool
  },
  CheckCollisionBoxSphere: {
    args: [FFIType.ptr, FFIType.ptr, FFIType.f32],
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
    args: [FFIType.ptr, FFIType.ptr],
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
  },
  GetRayCollisionModelMesh: {
    args: [FFIType.ptr, FFIType.i32, FFIType.i32, FFIType.ptr, FFIType.ptr],
    returns: FFIType.void
  },
  // Optimized model functions - get multiple values in one call
  GetModelDataBySlot: {
    args: [FFIType.i32, FFIType.ptr],
    returns: FFIType.void
  },
  GetModelBoundingBoxBySlot: {
    args: [FFIType.i32, FFIType.ptr],
    returns: FFIType.void
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
    args: [FFIType.ptr, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.ptr],
    returns: FFIType.void
  },
  GetRayCollisionBoxWrapper: {
    args: [FFIType.ptr, FFIType.ptr, FFIType.ptr],
    returns: FFIType.void
  },
  GetRayCollisionTriangleWrapper: {
    args: [FFIType.ptr, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.ptr],
    returns: FFIType.void
  },
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
  // Optimized API - get all data at once (1 call)
  GetLastCollisionData: {
    args: [FFIType.ptr],
    returns: FFIType.void
  },
};

const triangleWrapperSymbols = {
  // Triangle drawing functions
  DrawTriangleWrapper: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.u32],
    returns: FFIType.void
  },
  DrawTriangleFanWrapper: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.u32],
    returns: FFIType.void
  },
};

export interface FFILoaderConfig {
  platformInfo?: PlatformInfo;
  libraryPaths?: LibraryPaths;
  fallbackPaths?: string[];
}

/**
 * Attempts to load a library with fallback paths
 */
function loadLibraryWithFallback(
  primaryPath: string,
  fallbackPaths: string[],
  symbols: any,
  libraryName: string
): any {
  const allPaths = [primaryPath, ...fallbackPaths];
  const errors: string[] = [];

  for (const path of allPaths) {
    try {
      if (PlatformManager.validateLibraryExists(path)) {
        return dlopen(path, symbols);
      } else {
        errors.push(`${path}: File does not exist`);
      }
    } catch (error) {
      errors.push(`${path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // If all paths failed, throw comprehensive error
  const platformInfo = PlatformManager.detectPlatform();
  throw new LibraryNotFoundError(
    primaryPath,
    `${libraryName} library could not be loaded from any of the following paths:\n${errors.map(e => `  - ${e}`).join('\n')}\n\nPlatform: ${platformInfo.os}-${platformInfo.arch}\nInstallation instructions: ${PlatformManager.getInstallationInstructions(platformInfo.os)}`
  );
}

export const initRaylib = (libraryPath: string, config?: FFILoaderConfig) => {
  try {
    // Detect platform automatically if config is not provided
    const platformInfo = config?.platformInfo || PlatformManager.detectPlatform();

    // Generate platform-specific library paths if not provided
    const libraryPaths = config?.libraryPaths || PlatformManager.getLibraryPaths();

    // Generate fallback paths: prebuilt -> local compilation -> system
    const prebuiltPaths = PlatformManager.getPrebuiltLibraryPaths();
    const systemPaths = PlatformManager.getLibraryPaths('/usr/local/lib');
    const customFallbacks = config?.fallbackPaths || [];

    // Load main raylib library
    const lib = dlopen(libraryPath, symbolsDefinition);

    // Load wrapper libraries with fallback mechanisms
    const wrapperLib = loadLibraryWithFallback(
      libraryPaths.textureWrapper,
      [prebuiltPaths.textureWrapper, systemPaths.textureWrapper, ...customFallbacks],
      wrapperSymbols,
      'texture-wrapper'
    );

    const renderTextureWrapperLib = loadLibraryWithFallback(
      libraryPaths.renderTextureWrapper,
      [prebuiltPaths.renderTextureWrapper, systemPaths.renderTextureWrapper, ...customFallbacks],
      renderTextureWrapperSymbols,
      'render-texture-wrapper'
    );

    const modelWrapperLib = loadLibraryWithFallback(
      libraryPaths.modelWrapper,
      [prebuiltPaths.modelWrapper, systemPaths.modelWrapper, ...customFallbacks],
      modelWrapperSymbols,
      'model-wrapper'
    );

    const rayCollisionWrapperLib = loadLibraryWithFallback(
      libraryPaths.rayCollisionWrapper,
      [prebuiltPaths.rayCollisionWrapper, systemPaths.rayCollisionWrapper, ...customFallbacks],
      rayCollisionWrapperSymbols,
      'ray-collision-wrapper'
    );

    const triangleWrapperLib = loadLibraryWithFallback(
        libraryPaths.triangleWrapper,
        [prebuiltPaths.triangleWrapper, systemPaths.triangleWrapper, ...customFallbacks],
        triangleWrapperSymbols,
        'triangle-wrapper'
      );

    return {
      ...lib.symbols,
      ...wrapperLib.symbols,
      ...renderTextureWrapperLib.symbols,
      ...modelWrapperLib.symbols,
      ...rayCollisionWrapperLib.symbols,
      ...triangleWrapperLib.symbols
    };
  } catch (error) {
    // Enhanced error reporting with platform information
    const platformInfo = PlatformManager.detectPlatform();

    if (error instanceof LibraryNotFoundError) {
      throw error; // Re-throw library-specific errors as-is
    }

    throw new Error(
      `Failed to initialize Raylib on ${platformInfo.os}-${platformInfo.arch}.\n` +
      `Main library path: ${libraryPath}\n` +
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}\n` +
      `Installation instructions: ${PlatformManager.getInstallationInstructions(platformInfo.os)}`
    );
  }
};
