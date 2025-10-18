#include "raylib.h"
#include <stdlib.h>

// Export macro for Windows DLL
#ifdef _WIN32
    #define EXPORT __declspec(dllexport)
#else
    #define EXPORT
#endif

#define MAX_RENDER_TEXTURES 64

// Render texture storage
typedef struct {
    RenderTexture2D renderTexture;
    bool isLoaded;
} RenderTextureSlot;

static RenderTextureSlot renderTextureSlots[MAX_RENDER_TEXTURES] = {0};

// Find free slot for new render texture
int FindFreeRenderTextureSlot() {
    for (int i = 0; i < MAX_RENDER_TEXTURES; i++) {
        if (!renderTextureSlots[i].isLoaded) {
            return i;
        }
    }
    return -1; // No free slots
}

// Load render texture and return slot index
EXPORT int LoadRenderTextureToSlot(int width, int height) {
    int slotIndex = FindFreeRenderTextureSlot();
    if (slotIndex == -1) {
        return -1; // No free slots
    }
    
    RenderTexture2D renderTexture = LoadRenderTexture(width, height);
    if (renderTexture.id == 0) {
        return -1; // Failed to load
    }
    
    renderTextureSlots[slotIndex].renderTexture = renderTexture;
    renderTextureSlots[slotIndex].isLoaded = true;
    
    return slotIndex;
}

// Get render texture properties by slot index
EXPORT unsigned int GetRenderTextureIdBySlot(int slotIndex) {
    if (slotIndex < 0 || slotIndex >= MAX_RENDER_TEXTURES || !renderTextureSlots[slotIndex].isLoaded) {
        return 0;
    }
    return renderTextureSlots[slotIndex].renderTexture.id;
}

// Get color texture properties
EXPORT unsigned int GetRenderTextureColorIdBySlot(int slotIndex) {
    if (slotIndex < 0 || slotIndex >= MAX_RENDER_TEXTURES || !renderTextureSlots[slotIndex].isLoaded) {
        return 0;
    }
    return renderTextureSlots[slotIndex].renderTexture.texture.id;
}

EXPORT int GetRenderTextureColorWidthBySlot(int slotIndex) {
    if (slotIndex < 0 || slotIndex >= MAX_RENDER_TEXTURES || !renderTextureSlots[slotIndex].isLoaded) {
        return 0;
    }
    return renderTextureSlots[slotIndex].renderTexture.texture.width;
}

EXPORT int GetRenderTextureColorHeightBySlot(int slotIndex) {
    if (slotIndex < 0 || slotIndex >= MAX_RENDER_TEXTURES || !renderTextureSlots[slotIndex].isLoaded) {
        return 0;
    }
    return renderTextureSlots[slotIndex].renderTexture.texture.height;
}

EXPORT int GetRenderTextureColorMipmapsBySlot(int slotIndex) {
    if (slotIndex < 0 || slotIndex >= MAX_RENDER_TEXTURES || !renderTextureSlots[slotIndex].isLoaded) {
        return 0;
    }
    return renderTextureSlots[slotIndex].renderTexture.texture.mipmaps;
}

EXPORT int GetRenderTextureColorFormatBySlot(int slotIndex) {
    if (slotIndex < 0 || slotIndex >= MAX_RENDER_TEXTURES || !renderTextureSlots[slotIndex].isLoaded) {
        return 0;
    }
    return renderTextureSlots[slotIndex].renderTexture.texture.format;
}

// Get depth texture properties
EXPORT unsigned int GetRenderTextureDepthIdBySlot(int slotIndex) {
    if (slotIndex < 0 || slotIndex >= MAX_RENDER_TEXTURES || !renderTextureSlots[slotIndex].isLoaded) {
        return 0;
    }
    return renderTextureSlots[slotIndex].renderTexture.depth.id;
}

EXPORT int GetRenderTextureDepthWidthBySlot(int slotIndex) {
    if (slotIndex < 0 || slotIndex >= MAX_RENDER_TEXTURES || !renderTextureSlots[slotIndex].isLoaded) {
        return 0;
    }
    return renderTextureSlots[slotIndex].renderTexture.depth.width;
}

EXPORT int GetRenderTextureDepthHeightBySlot(int slotIndex) {
    if (slotIndex < 0 || slotIndex >= MAX_RENDER_TEXTURES || !renderTextureSlots[slotIndex].isLoaded) {
        return 0;
    }
    return renderTextureSlots[slotIndex].renderTexture.depth.height;
}

EXPORT int GetRenderTextureDepthMipmapsBySlot(int slotIndex) {
    if (slotIndex < 0 || slotIndex >= MAX_RENDER_TEXTURES || !renderTextureSlots[slotIndex].isLoaded) {
        return 0;
    }
    return renderTextureSlots[slotIndex].renderTexture.depth.mipmaps;
}

EXPORT int GetRenderTextureDepthFormatBySlot(int slotIndex) {
    if (slotIndex < 0 || slotIndex >= MAX_RENDER_TEXTURES || !renderTextureSlots[slotIndex].isLoaded) {
        return 0;
    }
    return renderTextureSlots[slotIndex].renderTexture.depth.format;
}

// Unload render texture by slot index
EXPORT void UnloadRenderTextureBySlot(int slotIndex) {
    if (slotIndex < 0 || slotIndex >= MAX_RENDER_TEXTURES || !renderTextureSlots[slotIndex].isLoaded) {
        return;
    }
    
    UnloadRenderTexture(renderTextureSlots[slotIndex].renderTexture);
    renderTextureSlots[slotIndex].isLoaded = false;
    renderTextureSlots[slotIndex].renderTexture = (RenderTexture2D){0};
}

// Get number of loaded render textures
EXPORT int GetLoadedRenderTextureCount() {
    int count = 0;
    for (int i = 0; i < MAX_RENDER_TEXTURES; i++) {
        if (renderTextureSlots[i].isLoaded) {
            count++;
        }
    }
    return count;
}

// Unload all render textures
EXPORT void UnloadAllRenderTextures() {
    for (int i = 0; i < MAX_RENDER_TEXTURES; i++) {
        if (renderTextureSlots[i].isLoaded) {
            UnloadRenderTextureBySlot(i);
        }
    }
}