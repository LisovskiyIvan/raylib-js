#include "raylib.h"
#include "raymath.h"
#include <stdlib.h>

// Export macro for Windows DLL
#ifdef _WIN32
#define EXPORT __declspec(dllexport)
#else
#define EXPORT
#endif
#include <string.h>

// Export macro for Windows DLL
#ifdef _WIN32
#define EXPORT __declspec(dllexport)
#else
#define EXPORT
#endif
#define MAX_MODELS 64

// Model storage with metadata
typedef struct {
  Model model;
  bool isLoaded;
  char fileName[256];
  BoundingBox boundingBox;
} ModelSlot;

static ModelSlot modelSlots[MAX_MODELS] = {0};

// Find free slot for new model
int FindFreeModelSlot() {
  for (int i = 0; i < MAX_MODELS; i++) {
    if (!modelSlots[i].isLoaded) {
      return i;
    }
  }
  return -1; // No free slots
}

// Load model and return slot index
EXPORT int LoadModelToSlot(const char *fileName, int *outBuffer) {
  int slotIndex = FindFreeModelSlot();
  if (slotIndex == -1) {
    return -1; // No free slots
  }

  Model model = LoadModel(fileName);

  // Check if model loaded successfully
  // A valid model should have at least one mesh
  if (model.meshCount == 0) {
    return -1; // Failed to load
  }
  // Calculate and cache bounding box
  BoundingBox bbox = GetModelBoundingBox(model);

  modelSlots[slotIndex].model = model;
  modelSlots[slotIndex].isLoaded = true;
  modelSlots[slotIndex].boundingBox = bbox;
  strncpy(modelSlots[slotIndex].fileName, fileName, 255);
  modelSlots[slotIndex].fileName[255] = '\0';

  outBuffer[0] = slotIndex;
  outBuffer[1] = model.meshCount;
  outBuffer[2] = model.materialCount;

  return slotIndex;
}

// Get model properties by slot index
EXPORT int GetModelMeshCountBySlot(int slotIndex) {
  if (slotIndex < 0 || slotIndex >= MAX_MODELS ||
      !modelSlots[slotIndex].isLoaded) {
    return 0;
  }
  return modelSlots[slotIndex].model.meshCount;
}

EXPORT int GetModelMaterialCountBySlot(int slotIndex) {
  if (slotIndex < 0 || slotIndex >= MAX_MODELS ||
      !modelSlots[slotIndex].isLoaded) {
    return 0;
  }
  return modelSlots[slotIndex].model.materialCount;
}

// Get bounding box by slot index (returns individual components)
EXPORT float GetModelBoundingBoxMinXBySlot(int slotIndex) {
  if (slotIndex < 0 || slotIndex >= MAX_MODELS ||
      !modelSlots[slotIndex].isLoaded) {
    return 0.0f;
  }
  return modelSlots[slotIndex].boundingBox.min.x;
}

EXPORT float GetModelBoundingBoxMinYBySlot(int slotIndex) {
  if (slotIndex < 0 || slotIndex >= MAX_MODELS ||
      !modelSlots[slotIndex].isLoaded) {
    return 0.0f;
  }
  return modelSlots[slotIndex].boundingBox.min.y;
}

EXPORT float GetModelBoundingBoxMinZBySlot(int slotIndex) {
  if (slotIndex < 0 || slotIndex >= MAX_MODELS ||
      !modelSlots[slotIndex].isLoaded) {
    return 0.0f;
  }
  return modelSlots[slotIndex].boundingBox.min.z;
}

EXPORT float GetModelBoundingBoxMaxXBySlot(int slotIndex) {
  if (slotIndex < 0 || slotIndex >= MAX_MODELS ||
      !modelSlots[slotIndex].isLoaded) {
    return 0.0f;
  }
  return modelSlots[slotIndex].boundingBox.max.x;
}

EXPORT float GetModelBoundingBoxMaxYBySlot(int slotIndex) {
  if (slotIndex < 0 || slotIndex >= MAX_MODELS ||
      !modelSlots[slotIndex].isLoaded) {
    return 0.0f;
  }
  return modelSlots[slotIndex].boundingBox.max.y;
}

EXPORT float GetModelBoundingBoxMaxZBySlot(int slotIndex) {
  if (slotIndex < 0 || slotIndex >= MAX_MODELS ||
      !modelSlots[slotIndex].isLoaded) {
    return 0.0f;
  }
  return modelSlots[slotIndex].boundingBox.max.z;
}

// Unload model by slot index
EXPORT void UnloadModelBySlot(int slotIndex) {
  if (slotIndex < 0 || slotIndex >= MAX_MODELS ||
      !modelSlots[slotIndex].isLoaded) {
    return;
  }

  UnloadModel(modelSlots[slotIndex].model);
  modelSlots[slotIndex].isLoaded = false;
  modelSlots[slotIndex].model = (Model){0};
  modelSlots[slotIndex].boundingBox = (BoundingBox){0};
  memset(modelSlots[slotIndex].fileName, 0, 256);
}

// Draw model by slot index
EXPORT void DrawModelBySlot(int slotIndex, float posX, float posY, float posZ,
                            float scale, Color tint) {
  if (slotIndex < 0 || slotIndex >= MAX_MODELS ||
      !modelSlots[slotIndex].isLoaded) {
    return;
  }

  Vector3 position = {posX, posY, posZ};
  DrawModel(modelSlots[slotIndex].model, position, scale, tint);
}

// Draw model with extended parameters
EXPORT void DrawModelExBySlot(int slotIndex, float posX, float posY, float posZ,
                              float rotAxisX, float rotAxisY, float rotAxisZ,
                              float rotationAngle, float scaleX, float scaleY,
                              float scaleZ, Color tint) {
  if (slotIndex < 0 || slotIndex >= MAX_MODELS ||
      !modelSlots[slotIndex].isLoaded) {
    return;
  }

  Vector3 position = {posX, posY, posZ};
  Vector3 rotationAxis = {rotAxisX, rotAxisY, rotAxisZ};
  Vector3 scale = {scaleX, scaleY, scaleZ};
  DrawModelEx(modelSlots[slotIndex].model, position, rotationAxis,
              rotationAngle, scale, tint);
}

// Draw model wires by slot index
EXPORT void DrawModelWiresBySlot(int slotIndex, float posX, float posY,
                                 float posZ, float scale, Color tint) {
  if (slotIndex < 0 || slotIndex >= MAX_MODELS ||
      !modelSlots[slotIndex].isLoaded) {
    return;
  }

  Vector3 position = {posX, posY, posZ};
  DrawModelWires(modelSlots[slotIndex].model, position, scale, tint);
}

// Get number of loaded models
EXPORT int GetLoadedModelCount() {
  int count = 0;
  for (int i = 0; i < MAX_MODELS; i++) {
    if (modelSlots[i].isLoaded) {
      count++;
    }
  }
  return count;
}

// Unload all models
EXPORT void UnloadAllModels() {
  for (int i = 0; i < MAX_MODELS; i++) {
    if (modelSlots[i].isLoaded) {
      UnloadModelBySlot(i);
    }
  }
}

// Check if model slot is valid and loaded
EXPORT bool IsModelSlotValid(int slotIndex) {
  return (slotIndex >= 0 && slotIndex < MAX_MODELS &&
          modelSlots[slotIndex].isLoaded);
}

// Get pointer to Model from slot (for animation system)
EXPORT Model *GetModelPointerFromSlot(int slotIndex) {
  if (slotIndex < 0 || slotIndex >= MAX_MODELS ||
      !modelSlots[slotIndex].isLoaded) {
    return NULL;
  }
  return &modelSlots[slotIndex].model;
}

// Optimized: Get model data in one call (slotIndex, meshCount, materialCount)
EXPORT void GetModelDataBySlot(int slotIndex, int *outBuffer) {
  // Initialize output buffer
  outBuffer[0] = -1; // slotIndex (invalid by default)
  outBuffer[1] = 0;  // meshCount
  outBuffer[2] = 0;  // materialCount

  if (slotIndex < 0 || slotIndex >= MAX_MODELS ||
      !modelSlots[slotIndex].isLoaded) {
    return;
  }

  outBuffer[0] = slotIndex;
  outBuffer[1] = modelSlots[slotIndex].model.meshCount;
  outBuffer[2] = modelSlots[slotIndex].model.materialCount;
}

// Optimized: Get bounding box in one call (min.x, min.y, min.z, max.x, max.y,
// max.z)
EXPORT void GetModelBoundingBoxBySlot(int slotIndex, float *outBuffer) {
  // Initialize output buffer
  outBuffer[0] = 0.0f; // min.x
  outBuffer[1] = 0.0f; // min.y
  outBuffer[2] = 0.0f; // min.z
  outBuffer[3] = 0.0f; // max.x
  outBuffer[4] = 0.0f; // max.y
  outBuffer[5] = 0.0f; // max.z

  if (slotIndex < 0 || slotIndex >= MAX_MODELS ||
      !modelSlots[slotIndex].isLoaded) {
    return;
  }

  BoundingBox bbox = modelSlots[slotIndex].boundingBox;
  outBuffer[0] = bbox.min.x;
  outBuffer[1] = bbox.min.y;
  outBuffer[2] = bbox.min.z;
  outBuffer[3] = bbox.max.x;
  outBuffer[4] = bbox.max.y;
  outBuffer[5] = bbox.max.z;
}

// Get ray collision with model mesh
EXPORT void GetRayCollisionModelMesh(Ray *ray, int slotIndex, int meshIndex,
                                     Matrix *transform, float *outBuffer) {
  // Initialize output buffer as no hit
  outBuffer[0] = 0.0f; // hit
  outBuffer[1] = 0.0f; // distance
  outBuffer[2] = 0.0f; // point.x
  outBuffer[3] = 0.0f; // point.y
  outBuffer[4] = 0.0f; // point.z
  outBuffer[5] = 0.0f; // normal.x
  outBuffer[6] = 0.0f; // normal.y
  outBuffer[7] = 0.0f; // normal.z

  // Validate slot and mesh index
  if (slotIndex < 0 || slotIndex >= MAX_MODELS ||
      !modelSlots[slotIndex].isLoaded) {
    return;
  }

  Model *model = &modelSlots[slotIndex].model;
  if (meshIndex < 0 || meshIndex >= model->meshCount) {
    return;
  }

  // Get the mesh
  Mesh mesh = model->meshes[meshIndex];

  // Use Raylib's built-in function
  Matrix finalTransform = transform ? *transform : MatrixIdentity();
  RayCollision collision = GetRayCollisionMesh(*ray, mesh, finalTransform);

  // Write collision data to output buffer
  outBuffer[0] = collision.hit ? 1.0f : 0.0f;
  outBuffer[1] = collision.distance;
  outBuffer[2] = collision.point.x;
  outBuffer[3] = collision.point.y;
  outBuffer[4] = collision.point.z;
  outBuffer[5] = collision.normal.x;
  outBuffer[6] = collision.normal.y;
  outBuffer[7] = collision.normal.z;
}

// ============================================================================
// ANIMATION FUNCTIONS (integrated into model wrapper)
// ============================================================================

#define MAX_ANIMATIONS 32

// Animation storage with metadata
typedef struct {
  ModelAnimation *animations; // Array of animations from file
  int animCount;              // Number of animations loaded
  bool isValid;               // Slot validity flag
} AnimationSlot;

static AnimationSlot animationSlots[MAX_ANIMATIONS] = {0};

// Find free slot for new animation
int FindFreeAnimationSlot() {
  for (int i = 0; i < MAX_ANIMATIONS; i++) {
    if (!animationSlots[i].isValid) {
      return i;
    }
  }
  return -1; // No free slots
}

// Load model animations and return slot index
EXPORT int LoadModelAnimationsToSlot(const char *fileName, int *outAnimCount) {
  int slotIndex = FindFreeAnimationSlot();
  if (slotIndex == -1) {
    *outAnimCount = 0;
    return -1; // No free slots
  }

  unsigned int animCount = 0;
  ModelAnimation *animations = LoadModelAnimations(fileName, &animCount);

  // Check if animations loaded successfully
  if (animations == NULL || animCount == 0) {
    *outAnimCount = 0;
    return -1; // Failed to load
  }

  animationSlots[slotIndex].animations = animations;
  animationSlots[slotIndex].animCount = (int)animCount;
  animationSlots[slotIndex].isValid = true;

  *outAnimCount = (int)animCount;
  return slotIndex;
}

// Update model animation (CPU skinning)
EXPORT void UpdateModelAnimationBySlot(int modelSlotIndex, int animSlot,
                                       int animIndex, int frame) {
  // Get model pointer
  Model *model = GetModelPointerFromSlot(modelSlotIndex);
  if (model == NULL) {
    return;
  }

  // Validate animation slot
  if (animSlot < 0 || animSlot >= MAX_ANIMATIONS ||
      !animationSlots[animSlot].isValid) {
    return;
  }

  // Validate animation index
  if (animIndex < 0 || animIndex >= animationSlots[animSlot].animCount) {
    return;
  }

  ModelAnimation *anim = &animationSlots[animSlot].animations[animIndex];

  // Clamp frame to valid range
  int clampedFrame = frame;
  if (clampedFrame < 0)
    clampedFrame = 0;
  if (clampedFrame >= anim->frameCount)
    clampedFrame = anim->frameCount - 1;

  // Update the model animation
  UpdateModelAnimation(*model, *anim, clampedFrame);
}

// Update model animation bones (GPU skinning)
EXPORT void UpdateModelAnimationBonesBySlot(int modelSlotIndex, int animSlot,
                                            int animIndex, int frame) {
  // Get model pointer
  Model *model = GetModelPointerFromSlot(modelSlotIndex);
  if (model == NULL) {
    return;
  }

  // Validate animation slot
  if (animSlot < 0 || animSlot >= MAX_ANIMATIONS ||
      !animationSlots[animSlot].isValid) {
    return;
  }

  // Validate animation index
  if (animIndex < 0 || animIndex >= animationSlots[animSlot].animCount) {
    return;
  }

  ModelAnimation *anim = &animationSlots[animSlot].animations[animIndex];

  // Clamp frame to valid range
  int clampedFrame = frame;
  if (clampedFrame < 0)
    clampedFrame = 0;
  if (clampedFrame >= anim->frameCount)
    clampedFrame = anim->frameCount - 1;

  // Update the model animation bones
  UpdateModelAnimationBones(*model, *anim, clampedFrame);
}

// Validate animation compatibility with model
EXPORT bool IsModelAnimationValidBySlot(int modelSlotIndex, int animSlot,
                                        int animIndex) {
  // Get model pointer
  Model *model = GetModelPointerFromSlot(modelSlotIndex);
  if (model == NULL) {
    return false;
  }

  // Validate animation slot
  if (animSlot < 0 || animSlot >= MAX_ANIMATIONS ||
      !animationSlots[animSlot].isValid) {
    return false;
  }

  // Validate animation index
  if (animIndex < 0 || animIndex >= animationSlots[animSlot].animCount) {
    return false;
  }

  ModelAnimation *anim = &animationSlots[animSlot].animations[animIndex];

  // Check if animation is valid for the model
  return IsModelAnimationValid(*model, *anim);
}

// Unload animation by slot index
EXPORT void UnloadModelAnimationBySlot(int animSlot) {
  if (animSlot < 0 || animSlot >= MAX_ANIMATIONS ||
      !animationSlots[animSlot].isValid) {
    return;
  }

  // Unload all animations in the array
  if (animationSlots[animSlot].animations != NULL) {
    UnloadModelAnimations(animationSlots[animSlot].animations,
                          animationSlots[animSlot].animCount);
    animationSlots[animSlot].animations = NULL;
  }

  animationSlots[animSlot].animCount = 0;
  animationSlots[animSlot].isValid = false;
}

// Unload all animations
EXPORT void UnloadAllAnimations() {
  for (int i = 0; i < MAX_ANIMATIONS; i++) {
    if (animationSlots[i].isValid) {
      UnloadModelAnimationBySlot(i);
    }
  }
}

// Get animation data by slot index (frameCount, boneCount)
EXPORT void GetAnimationDataBySlot(int animSlot, int animIndex, int *outData) {
  // Initialize output buffer
  outData[0] = 0; // frameCount
  outData[1] = 0; // boneCount

  // Validate animation slot
  if (animSlot < 0 || animSlot >= MAX_ANIMATIONS ||
      !animationSlots[animSlot].isValid) {
    return;
  }

  // Validate animation index
  if (animIndex < 0 || animIndex >= animationSlots[animSlot].animCount) {
    return;
  }

  ModelAnimation *anim = &animationSlots[animSlot].animations[animIndex];
  outData[0] = anim->frameCount;
  outData[1] = anim->boneCount;
}

// Get number of loaded animation slots
EXPORT int GetLoadedAnimationCount() {
  int count = 0;
  for (int i = 0; i < MAX_ANIMATIONS; i++) {
    if (animationSlots[i].isValid) {
      count++;
    }
  }
  return count;
}

// Check if animation slot is valid
EXPORT bool IsAnimationSlotValid(int animSlot) {
  return (animSlot >= 0 && animSlot < MAX_ANIMATIONS &&
          animationSlots[animSlot].isValid);
}
