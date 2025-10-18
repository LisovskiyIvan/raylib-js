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
EXPORT int LoadModelToSlot(const char* fileName, int* outBuffer) {
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
    if (slotIndex < 0 || slotIndex >= MAX_MODELS || !modelSlots[slotIndex].isLoaded) {
        return 0;
    }
    return modelSlots[slotIndex].model.meshCount;
}

EXPORT int GetModelMaterialCountBySlot(int slotIndex) {
    if (slotIndex < 0 || slotIndex >= MAX_MODELS || !modelSlots[slotIndex].isLoaded) {
        return 0;
    }
    return modelSlots[slotIndex].model.materialCount;
}

// Get bounding box by slot index (returns individual components)
EXPORT float GetModelBoundingBoxMinXBySlot(int slotIndex) {
    if (slotIndex < 0 || slotIndex >= MAX_MODELS || !modelSlots[slotIndex].isLoaded) {
        return 0.0f;
    }
    return modelSlots[slotIndex].boundingBox.min.x;
}

EXPORT float GetModelBoundingBoxMinYBySlot(int slotIndex) {
    if (slotIndex < 0 || slotIndex >= MAX_MODELS || !modelSlots[slotIndex].isLoaded) {
        return 0.0f;
    }
    return modelSlots[slotIndex].boundingBox.min.y;
}

EXPORT float GetModelBoundingBoxMinZBySlot(int slotIndex) {
    if (slotIndex < 0 || slotIndex >= MAX_MODELS || !modelSlots[slotIndex].isLoaded) {
        return 0.0f;
    }
    return modelSlots[slotIndex].boundingBox.min.z;
}

EXPORT float GetModelBoundingBoxMaxXBySlot(int slotIndex) {
    if (slotIndex < 0 || slotIndex >= MAX_MODELS || !modelSlots[slotIndex].isLoaded) {
        return 0.0f;
    }
    return modelSlots[slotIndex].boundingBox.max.x;
}

EXPORT float GetModelBoundingBoxMaxYBySlot(int slotIndex) {
    if (slotIndex < 0 || slotIndex >= MAX_MODELS || !modelSlots[slotIndex].isLoaded) {
        return 0.0f;
    }
    return modelSlots[slotIndex].boundingBox.max.y;
}

EXPORT float GetModelBoundingBoxMaxZBySlot(int slotIndex) {
    if (slotIndex < 0 || slotIndex >= MAX_MODELS || !modelSlots[slotIndex].isLoaded) {
        return 0.0f;
    }
    return modelSlots[slotIndex].boundingBox.max.z;
}

// Unload model by slot index
EXPORT void UnloadModelBySlot(int slotIndex) {
    if (slotIndex < 0 || slotIndex >= MAX_MODELS || !modelSlots[slotIndex].isLoaded) {
        return;
    }
    
    UnloadModel(modelSlots[slotIndex].model);
    modelSlots[slotIndex].isLoaded = false;
    modelSlots[slotIndex].model = (Model){0};
    modelSlots[slotIndex].boundingBox = (BoundingBox){0};
    memset(modelSlots[slotIndex].fileName, 0, 256);
}

// Draw model by slot index
EXPORT void DrawModelBySlot(int slotIndex, Vector3 position, float scale, Color tint) {
    if (slotIndex < 0 || slotIndex >= MAX_MODELS || !modelSlots[slotIndex].isLoaded) {
        return;
    }
    
    DrawModel(modelSlots[slotIndex].model, position, scale, tint);
}

// Draw model with extended parameters
EXPORT void DrawModelExBySlot(int slotIndex, Vector3 position, Vector3 rotationAxis, float rotationAngle, Vector3 scale, Color tint) {
    if (slotIndex < 0 || slotIndex >= MAX_MODELS || !modelSlots[slotIndex].isLoaded) {
        return;
    }
    
    DrawModelEx(modelSlots[slotIndex].model, position, rotationAxis, rotationAngle, scale, tint);
}

// Draw model wires by slot index
EXPORT void DrawModelWiresBySlot(int slotIndex, Vector3 position, float scale, Color tint) {
    if (slotIndex < 0 || slotIndex >= MAX_MODELS || !modelSlots[slotIndex].isLoaded) {
        return;
    }
    
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
    return (slotIndex >= 0 && slotIndex < MAX_MODELS && modelSlots[slotIndex].isLoaded);
}

// Optimized: Get model data in one call (slotIndex, meshCount, materialCount)
EXPORT void GetModelDataBySlot(int slotIndex, int* outBuffer) {
    // Initialize output buffer
    outBuffer[0] = -1; // slotIndex (invalid by default)
    outBuffer[1] = 0;  // meshCount
    outBuffer[2] = 0;  // materialCount
    
    if (slotIndex < 0 || slotIndex >= MAX_MODELS || !modelSlots[slotIndex].isLoaded) {
        return;
    }
    
    outBuffer[0] = slotIndex;
    outBuffer[1] = modelSlots[slotIndex].model.meshCount;
    outBuffer[2] = modelSlots[slotIndex].model.materialCount;
}

// Optimized: Get bounding box in one call (min.x, min.y, min.z, max.x, max.y, max.z)
EXPORT void GetModelBoundingBoxBySlot(int slotIndex, float* outBuffer) {
    // Initialize output buffer
    outBuffer[0] = 0.0f; // min.x
    outBuffer[1] = 0.0f; // min.y
    outBuffer[2] = 0.0f; // min.z
    outBuffer[3] = 0.0f; // max.x
    outBuffer[4] = 0.0f; // max.y
    outBuffer[5] = 0.0f; // max.z
    
    if (slotIndex < 0 || slotIndex >= MAX_MODELS || !modelSlots[slotIndex].isLoaded) {
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
EXPORT void GetRayCollisionModelMesh(Ray* ray, int slotIndex, int meshIndex, Matrix* transform, float* outBuffer) {
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
    if (slotIndex < 0 || slotIndex >= MAX_MODELS || !modelSlots[slotIndex].isLoaded) {
        return;
    }
    
    Model* model = &modelSlots[slotIndex].model;
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