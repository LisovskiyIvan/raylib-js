#include "raylib.h"
#include <stdbool.h>
#include <stdlib.h>
#include <string.h>

// Export macro for Windows DLL
#ifdef _WIN32
#define EXPORT __declspec(dllexport)
#else
#define EXPORT
#endif

#define MAX_SHADER_SLOTS 32
#define MAX_LOCATION_CACHE 32

// Shader storage with metadata and location cache
typedef struct {
  Shader shader;
  bool isValid;
  int locationCache[MAX_LOCATION_CACHE];
  char locationNames[MAX_LOCATION_CACHE][64];
  int cacheCount;
} ShaderSlot;

static ShaderSlot shaderSlots[MAX_SHADER_SLOTS] = {0};

// Find free slot for new shader
int FindFreeShaderSlot() {
  for (int i = 0; i < MAX_SHADER_SLOTS; i++) {
    if (!shaderSlots[i].isValid) {
      return i;
    }
  }
  return -1; // No free slots
}

// Load shader from files and return slot index
EXPORT int LoadShaderToSlot(const char *vsFileName, const char *fsFileName) {
  int slotIndex = FindFreeShaderSlot();
  if (slotIndex == -1) {
    return -1; // No free slots
  }

  // Load shader from files (NULL means use default shader for that stage)
  Shader shader = LoadShader(vsFileName, fsFileName);

  // Check if shader loaded successfully
  // A valid shader should have a non-zero id
  if (shader.id == 0) {
    return -1; // Failed to load
  }

  shaderSlots[slotIndex].shader = shader;
  shaderSlots[slotIndex].isValid = true;
  shaderSlots[slotIndex].cacheCount = 0;

  // Clear location cache
  memset(shaderSlots[slotIndex].locationCache, -1,
         sizeof(shaderSlots[slotIndex].locationCache));
  memset(shaderSlots[slotIndex].locationNames, 0,
         sizeof(shaderSlots[slotIndex].locationNames));

  return slotIndex;
}

// Load shader from memory (code strings) and return slot index
EXPORT int LoadShaderFromMemoryToSlot(const char *vsCode, const char *fsCode) {
  int slotIndex = FindFreeShaderSlot();
  if (slotIndex == -1) {
    return -1; // No free slots
  }

  // Load shader from memory (NULL means use default shader for that stage)
  Shader shader = LoadShaderFromMemory(vsCode, fsCode);

  // Check if shader loaded successfully
  if (shader.id == 0) {
    return -1; // Failed to load
  }

  shaderSlots[slotIndex].shader = shader;
  shaderSlots[slotIndex].isValid = true;
  shaderSlots[slotIndex].cacheCount = 0;

  // Clear location cache
  memset(shaderSlots[slotIndex].locationCache, -1,
         sizeof(shaderSlots[slotIndex].locationCache));
  memset(shaderSlots[slotIndex].locationNames, 0,
         sizeof(shaderSlots[slotIndex].locationNames));

  return slotIndex;
}

// Unload shader by slot index
EXPORT void UnloadShaderBySlot(int slotIndex) {
  if (slotIndex < 0 || slotIndex >= MAX_SHADER_SLOTS ||
      !shaderSlots[slotIndex].isValid) {
    return;
  }

  UnloadShader(shaderSlots[slotIndex].shader);
  shaderSlots[slotIndex].isValid = false;
  shaderSlots[slotIndex].shader = (Shader){0};
  shaderSlots[slotIndex].cacheCount = 0;

  // Clear location cache
  memset(shaderSlots[slotIndex].locationCache, -1,
         sizeof(shaderSlots[slotIndex].locationCache));
  memset(shaderSlots[slotIndex].locationNames, 0,
         sizeof(shaderSlots[slotIndex].locationNames));
}

// Unload all shaders
EXPORT void UnloadAllShaders() {
  for (int i = 0; i < MAX_SHADER_SLOTS; i++) {
    if (shaderSlots[i].isValid) {
      UnloadShaderBySlot(i);
    }
  }
}

// Check if shader slot is valid
EXPORT bool IsShaderSlotValid(int slotIndex) {
  return (slotIndex >= 0 && slotIndex < MAX_SHADER_SLOTS &&
          shaderSlots[slotIndex].isValid);
}

// Get number of loaded shaders
EXPORT int GetLoadedShaderCount() {
  int count = 0;
  for (int i = 0; i < MAX_SHADER_SLOTS; i++) {
    if (shaderSlots[i].isValid) {
      count++;
    }
  }
  return count;
}

// Begin shader mode - activate shader for subsequent drawing
EXPORT void BeginShaderModeBySlot(int slotIndex) {
  if (slotIndex < 0 || slotIndex >= MAX_SHADER_SLOTS ||
      !shaderSlots[slotIndex].isValid) {
    return; // Invalid slot, do nothing
  }

  BeginShaderMode(shaderSlots[slotIndex].shader);
}

// End shader mode - deactivate custom shader
EXPORT void EndShaderModeWrapper() { EndShaderMode(); }

// Get shader uniform location with caching
EXPORT int GetShaderLocationBySlot(int slotIndex, const char *uniformName) {
  if (slotIndex < 0 || slotIndex >= MAX_SHADER_SLOTS ||
      !shaderSlots[slotIndex].isValid || uniformName == NULL) {
    return -1; // Invalid parameters
  }

  ShaderSlot *slot = &shaderSlots[slotIndex];

  // Check if location is already cached
  for (int i = 0; i < slot->cacheCount; i++) {
    if (strcmp(slot->locationNames[i], uniformName) == 0) {
      return slot->locationCache[i]; // Return cached location
    }
  }

  // Location not cached, get it from raylib
  int location = GetShaderLocation(slot->shader, uniformName);

  // Cache the location if there's space and it's valid
  if (location != -1 && slot->cacheCount < MAX_LOCATION_CACHE) {
    slot->locationCache[slot->cacheCount] = location;
    strncpy(slot->locationNames[slot->cacheCount], uniformName, 63);
    slot->locationNames[slot->cacheCount][63] = '\0'; // Ensure null termination
    slot->cacheCount++;
  }

  return location;
}

// Set float uniform value
EXPORT void SetShaderValueFloatBySlot(int slotIndex, int locIndex,
                                      float value) {
  if (slotIndex < 0 || slotIndex >= MAX_SHADER_SLOTS ||
      !shaderSlots[slotIndex].isValid || locIndex < 0) {
    return; // Invalid parameters
  }

  SetShaderValue(shaderSlots[slotIndex].shader, locIndex, &value,
                 SHADER_UNIFORM_FLOAT);
}

// Set integer uniform value
EXPORT void SetShaderValueIntBySlot(int slotIndex, int locIndex, int value) {
  if (slotIndex < 0 || slotIndex >= MAX_SHADER_SLOTS ||
      !shaderSlots[slotIndex].isValid || locIndex < 0) {
    return; // Invalid parameters
  }

  SetShaderValue(shaderSlots[slotIndex].shader, locIndex, &value,
                 SHADER_UNIFORM_INT);
}

// Set vec2 uniform value
EXPORT void SetShaderValueVec2BySlot(int slotIndex, int locIndex, float x,
                                     float y) {
  if (slotIndex < 0 || slotIndex >= MAX_SHADER_SLOTS ||
      !shaderSlots[slotIndex].isValid || locIndex < 0) {
    return; // Invalid parameters
  }

  float vec2[2] = {x, y};
  SetShaderValue(shaderSlots[slotIndex].shader, locIndex, vec2,
                 SHADER_UNIFORM_VEC2);
}

// Set vec3 uniform value
EXPORT void SetShaderValueVec3BySlot(int slotIndex, int locIndex, float x,
                                     float y, float z) {
  if (slotIndex < 0 || slotIndex >= MAX_SHADER_SLOTS ||
      !shaderSlots[slotIndex].isValid || locIndex < 0) {
    return; // Invalid parameters
  }

  float vec3[3] = {x, y, z};
  SetShaderValue(shaderSlots[slotIndex].shader, locIndex, vec3,
                 SHADER_UNIFORM_VEC3);
}

// Set vec4 uniform value
EXPORT void SetShaderValueVec4BySlot(int slotIndex, int locIndex, float x,
                                     float y, float z, float w) {
  if (slotIndex < 0 || slotIndex >= MAX_SHADER_SLOTS ||
      !shaderSlots[slotIndex].isValid || locIndex < 0) {
    return; // Invalid parameters
  }

  float vec4[4] = {x, y, z, w};
  SetShaderValue(shaderSlots[slotIndex].shader, locIndex, vec4,
                 SHADER_UNIFORM_VEC4);
}

// Set texture uniform value (sampler2D)
EXPORT void SetShaderValueTextureBySlot(int slotIndex, int locIndex,
                                        int textureSlotIndex) {
  if (slotIndex < 0 || slotIndex >= MAX_SHADER_SLOTS ||
      !shaderSlots[slotIndex].isValid || locIndex < 0 || textureSlotIndex < 0) {
    return; // Invalid parameters
  }

  // For texture uniforms, we need to set the texture unit index
  SetShaderValue(shaderSlots[slotIndex].shader, locIndex, &textureSlotIndex,
                 SHADER_UNIFORM_SAMPLER2D);
}

// Begin blend mode - activate specified blend mode
EXPORT void BeginBlendModeWrapper(int mode) { BeginBlendMode(mode); }

// End blend mode - reset to default alpha blending
EXPORT void EndBlendModeWrapper() { EndBlendMode(); }

// Begin scissor mode - define scissor rectangle
EXPORT void BeginScissorModeWrapper(int x, int y, int width, int height) {
  BeginScissorMode(x, y, width, height);
}

// End scissor mode - remove scissor restriction
EXPORT void EndScissorModeWrapper() { EndScissorMode(); }
