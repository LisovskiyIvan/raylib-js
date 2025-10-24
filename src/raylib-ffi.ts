import { dlopen, FFIType } from 'bun:ffi';
import { PlatformManager, LibraryNotFoundError } from './platform/PlatformManager';
import type { PlatformInfo, LibraryPaths } from './platform/PlatformManager';

const raylibWrapperSymbols = {
  InitWindowWrapper: {
    args: [FFIType.i32, FFIType.i32, FFIType.ptr],
    returns: FFIType.void
  },
  CloseWindowWrapper: {
    args: [],
    returns: FFIType.void
  },
  WindowShouldCloseWrapper: {
    args: [],
    returns: FFIType.bool
  },
  BeginDrawingWrapper: {
    args: [],
    returns: FFIType.void
  },
  EndDrawingWrapper: {
    args: [],
    returns: FFIType.void
  },
  ClearBackgroundWrapper: {
    args: [FFIType.u32],
    returns: FFIType.void
  },
  DrawTextWrapper: {
    args: [FFIType.ptr, FFIType.i32, FFIType.i32, FFIType.i32, FFIType.u32],
    returns: FFIType.void
  },
  DrawRectangleWrapper: {
    args: [FFIType.i32, FFIType.i32, FFIType.i32, FFIType.i32, FFIType.u32],
    returns: FFIType.void
  },
  SetTargetFPSWrapper: {
    args: [FFIType.i32],
    returns: FFIType.void
  },
  DrawFPSWrapper: {
    args: [FFIType.i32, FFIType.i32],
    returns: FFIType.void
  },
  GetFrameTimeWrapper: {
    args: [],
    returns: FFIType.f32
  },
  IsKeyDownWrapper: {
    args: [FFIType.i16],
    returns: FFIType.bool
  },
  IsKeyUpWrapper: {
    args: [FFIType.i16],
    returns: FFIType.bool
  },
  GetKeyPressedWrapper: {
    args: [],
    returns: FFIType.i8
  },
  IsMouseButtonDownWrapper: {
    args: [FFIType.i32],
    returns: FFIType.bool
  },
  IsMouseButtonUpWrapper: {
    args: [FFIType.i32],
    returns: FFIType.bool
  },
  GetMouseXWrapper: {
    args: [],
    returns: FFIType.i32
  },
  GetMouseYWrapper: {
    args: [],
    returns: FFIType.i32
  },
  SetMousePositionWrapper: {
    args: [FFIType.i32, FFIType.i32],
    returns: FFIType.void
  },
  DisableCursorWrapper: {
    args: [],
    returns: FFIType.void
  },
  EnableCursorWrapper: {
    args: [],
    returns: FFIType.void
  },
  HideCursorWrapper: {
    args: [],
    returns: FFIType.void
  },
  ShowCursorWrapper: {
    args: [],
    returns: FFIType.void
  },
  IsCursorHiddenWrapper: {
    args: [],
    returns: FFIType.bool
  },
  DrawPixelWrapper: {
    args: [FFIType.i16, FFIType.i16, FFIType.u32],
    returns: FFIType.void
  },
  DrawLineWrapper: {
    args: [FFIType.i16, FFIType.i16, FFIType.i16, FFIType.i16, FFIType.u32],
    returns: FFIType.void
  },
  DrawCircleWrapper: {
    args: [FFIType.i16, FFIType.i16, FFIType.f32, FFIType.u32],
    returns: FFIType.void
  },
  DrawPolyWrapper: {
    args: [FFIType.f32, FFIType.f32, FFIType.i32, FFIType.f32, FFIType.f32, FFIType.u32],
    returns: FFIType.void
  },
  DrawTriangleFanWrapper: {
    args: [FFIType.ptr, FFIType.i32, FFIType.u32],
    returns: FFIType.void
  },
  DrawRectangleProWrapper: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.u32],
    returns: FFIType.void
  },
  CheckCollisionRecsWrapper: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32],
    returns: FFIType.bool
  },
  CheckCollisionCirclesWrapper: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32],
    returns: FFIType.bool
  },
  CheckCollisionCircleRecWrapper: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32],
    returns: FFIType.bool
  },
  CheckCollisionCircleLineWrapper: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32],
    returns: FFIType.bool
  },
  CheckCollisionPointRecWrapper: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32],
    returns: FFIType.bool
  },
  CheckCollisionPointCircleWrapper: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32],
    returns: FFIType.bool
  },
  CheckCollisionPointTriangleWrapper: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32],
    returns: FFIType.bool
  },
  // 3D Drawing functions
  DrawLine3DWrapper: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.u32],
    returns: FFIType.void
  },
  DrawPoint3DWrapper: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.u32],
    returns: FFIType.void
  },
  DrawCircle3DWrapper: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.u32],
    returns: FFIType.void
  },
  DrawTriangle3DWrapper: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.u32],
    returns: FFIType.void
  },
  // Additional 3D shapes
  DrawCubeWrapper: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.u32],
    returns: FFIType.void
  },
  DrawCubeVWrapper: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.u32],
    returns: FFIType.void
  },
  DrawSphereWrapper: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.u32],
    returns: FFIType.void
  },
  DrawCylinderWrapper: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.i32, FFIType.u32],
    returns: FFIType.void
  },
  DrawCapsuleWrapper: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.i32, FFIType.i32, FFIType.u32],
    returns: FFIType.void
  },
  DrawPlaneWrapper: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.u32],
    returns: FFIType.void
  },
  DrawRayWrapper: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.u32],
    returns: FFIType.void
  },
  DrawGridWrapper: {
    args: [FFIType.i32, FFIType.f32],
    returns: FFIType.void
  },
  // 3D Collision detection functions
  CheckCollisionSpheresWrapper: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32],
    returns: FFIType.bool
  },
  CheckCollisionBoxesWrapper: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32],
    returns: FFIType.bool
  },
  CheckCollisionBoxSphereWrapper: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32],
    returns: FFIType.bool
  },
  // 3D Camera and mode functions
  BeginMode3DWrapper: {
    args: [FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.i32],
    returns: FFIType.void
  },
  EndMode3DWrapper: {
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

const shaderWrapperSymbols = {
  // Shader loading
  LoadShaderToSlot: {
    args: [FFIType.ptr, FFIType.ptr],
    returns: FFIType.i32
  },
  LoadShaderFromMemoryToSlot: {
    args: [FFIType.ptr, FFIType.ptr],
    returns: FFIType.i32
  },
  UnloadShaderBySlot: {
    args: [FFIType.i32],
    returns: FFIType.void
  },
  UnloadAllShaders: {
    args: [],
    returns: FFIType.void
  },

  // Shader validation
  IsShaderSlotValid: {
    args: [FFIType.i32],
    returns: FFIType.bool
  },
  GetLoadedShaderCount: {
    args: [],
    returns: FFIType.i32
  },

  // Shader mode
  BeginShaderModeBySlot: {
    args: [FFIType.i32],
    returns: FFIType.void
  },
  EndShaderModeWrapper: {
    args: [],
    returns: FFIType.void
  },

  // Uniform management
  GetShaderLocationBySlot: {
    args: [FFIType.i32, FFIType.ptr],
    returns: FFIType.i32
  },
  SetShaderValueFloatBySlot: {
    args: [FFIType.i32, FFIType.i32, FFIType.f32],
    returns: FFIType.void
  },
  SetShaderValueIntBySlot: {
    args: [FFIType.i32, FFIType.i32, FFIType.i32],
    returns: FFIType.void
  },
  SetShaderValueVec2BySlot: {
    args: [FFIType.i32, FFIType.i32, FFIType.f32, FFIType.f32],
    returns: FFIType.void
  },
  SetShaderValueVec3BySlot: {
    args: [FFIType.i32, FFIType.i32, FFIType.f32, FFIType.f32, FFIType.f32],
    returns: FFIType.void
  },
  SetShaderValueVec4BySlot: {
    args: [FFIType.i32, FFIType.i32, FFIType.f32, FFIType.f32, FFIType.f32, FFIType.f32],
    returns: FFIType.void
  },
  SetShaderValueTextureBySlot: {
    args: [FFIType.i32, FFIType.i32, FFIType.i32],
    returns: FFIType.void
  },

  // Blend mode
  BeginBlendModeWrapper: {
    args: [FFIType.i32],
    returns: FFIType.void
  },
  EndBlendModeWrapper: {
    args: [],
    returns: FFIType.void
  },

  // Scissor mode
  BeginScissorModeWrapper: {
    args: [FFIType.i32, FFIType.i32, FFIType.i32, FFIType.i32],
    returns: FFIType.void
  },
  EndScissorModeWrapper: {
    args: [],
    returns: FFIType.void
  }
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
        // Convert to absolute path to help Windows find dependencies
        const absolutePath = require('path').resolve(path);
        const lib = dlopen(absolutePath, symbols);
        return lib;
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

export const initRaylib = (libraryPath?: string, config?: FFILoaderConfig) => {
  try {
    // Detect platform automatically if config is not provided
    const platformInfo = config?.platformInfo || PlatformManager.detectPlatform();

    // Use provided base path, or RAYLIB_PATH env var, or default to 'assets'
    const basePath = libraryPath || process.env.RAYLIB_PATH || 'assets';

    // Preload raylib library to ensure it's available for wrapper libraries
    const path = require('path');
    const raylibLibPath = path.resolve(basePath, 'raylib', 'lib');

    if (platformInfo.os === 'darwin') {
      const raylibPath = path.join(raylibLibPath, 'libraylib.dylib');
      if (PlatformManager.validateLibraryExists(raylibPath)) {
        try {
          dlopen(raylibPath, {
            GetColor: { args: [FFIType.u32], returns: FFIType.void }
          });
        } catch (e) {
          console.warn('Warning: Could not preload libraylib.dylib:', e);
        }
      }
    } else if (platformInfo.os === 'linux') {
      const raylibPath = path.join(raylibLibPath, 'libraylib.so');
      if (PlatformManager.validateLibraryExists(raylibPath)) {
        try {
          dlopen(raylibPath, {
            GetColor: { args: [FFIType.u32], returns: FFIType.void }
          });
        } catch (e) {
          console.warn('Warning: Could not preload libraylib.so:', e);
        }
      }
    } else if (platformInfo.os === 'windows') {
      const raylibPath = path.join(raylibLibPath, 'raylib.dll');
      if (PlatformManager.validateLibraryExists(raylibPath)) {
        try {
          dlopen(raylibPath, {
            GetColor: { args: [FFIType.u32], returns: FFIType.void }
          });
        } catch (e) {
          console.warn('Warning: Could not preload raylib.dll:', e);
        }
      }
    }

    // Generate platform-specific library paths if not provided
    // Wrapper libraries are in basePath, raylib itself is in basePath/raylib/lib
    const libraryPaths = config?.libraryPaths || PlatformManager.getLibraryPaths(basePath);

    // Generate fallback paths: prebuilt -> local compilation -> system
    const prebuiltPaths = PlatformManager.getPrebuiltLibraryPaths(basePath);
    const systemPaths = PlatformManager.getLibraryPaths('/usr/local/lib');
    const customFallbacks = config?.fallbackPaths || [];

    // Load raylib wrapper library
    const raylibWrapperLib = loadLibraryWithFallback(
      libraryPaths.raylibWrapper,
      [prebuiltPaths.raylibWrapper, systemPaths.raylibWrapper, ...customFallbacks],
      raylibWrapperSymbols,
      'raylib-wrapper'
    );

    // Load other wrapper libraries with fallback mechanisms
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

    const shaderWrapperLib = loadLibraryWithFallback(
      libraryPaths.shaderWrapper,
      [prebuiltPaths.shaderWrapper, systemPaths.shaderWrapper, ...customFallbacks],
      shaderWrapperSymbols,
      'shader-wrapper'
    );

    return {
      ...raylibWrapperLib.symbols,
      ...wrapperLib.symbols,
      ...renderTextureWrapperLib.symbols,
      ...modelWrapperLib.symbols,
      ...rayCollisionWrapperLib.symbols,
      ...triangleWrapperLib.symbols,
      ...shaderWrapperLib.symbols
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
