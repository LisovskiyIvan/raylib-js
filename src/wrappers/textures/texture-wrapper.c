#include "raylib.h"
#include <stdlib.h>
#include <string.h>

// Export macro for Windows DLL
#ifdef _WIN32
    #define EXPORT __declspec(dllexport)
#else
    #define EXPORT
#endif

#define MAX_TEXTURES 256

// Texture storage with metadata
typedef struct {
    Texture2D texture;
    bool isLoaded;
    char fileName[256];
} TextureSlot;

static TextureSlot textureSlots[MAX_TEXTURES] = {0};
static int nextSlotIndex = 0;

// Find free slot for new texture
int FindFreeTextureSlot() {
    for (int i = 0; i < MAX_TEXTURES; i++) {
        if (!textureSlots[i].isLoaded) {
            return i;
        }
    }
    return -1; // No free slots
}

// Load texture and return slot index
EXPORT int LoadTextureToSlot(const char* fileName) {
    int slotIndex = FindFreeTextureSlot();
    if (slotIndex == -1) {
        return -1; // No free slots
    }
    
    Texture2D texture = LoadTexture(fileName);
    if (texture.id == 0) {
        return -1; // Failed to load
    }
    
    textureSlots[slotIndex].texture = texture;
    textureSlots[slotIndex].isLoaded = true;
    strncpy(textureSlots[slotIndex].fileName, fileName, 255);
    textureSlots[slotIndex].fileName[255] = '\0';
    
    return slotIndex;
}

// Get texture properties by slot index
EXPORT int GetTextureWidthBySlot(int slotIndex) {
    if (slotIndex < 0 || slotIndex >= MAX_TEXTURES || !textureSlots[slotIndex].isLoaded) {
        return 0;
    }
    return textureSlots[slotIndex].texture.width;
}

EXPORT int GetTextureHeightBySlot(int slotIndex) {
    if (slotIndex < 0 || slotIndex >= MAX_TEXTURES || !textureSlots[slotIndex].isLoaded) {
        return 0;
    }
    return textureSlots[slotIndex].texture.height;
}

EXPORT int GetTextureMipmapsBySlot(int slotIndex) {
    if (slotIndex < 0 || slotIndex >= MAX_TEXTURES || !textureSlots[slotIndex].isLoaded) {
        return 0;
    }
    return textureSlots[slotIndex].texture.mipmaps;
}

EXPORT int GetTextureFormatBySlot(int slotIndex) {
    if (slotIndex < 0 || slotIndex >= MAX_TEXTURES || !textureSlots[slotIndex].isLoaded) {
        return 0;
    }
    return textureSlots[slotIndex].texture.format;
}

EXPORT unsigned int GetTextureIdBySlot(int slotIndex) {
    if (slotIndex < 0 || slotIndex >= MAX_TEXTURES || !textureSlots[slotIndex].isLoaded) {
        return 0;
    }
    return textureSlots[slotIndex].texture.id;
}

// Unload texture by slot index
EXPORT void UnloadTextureBySlot(int slotIndex) {
    if (slotIndex < 0 || slotIndex >= MAX_TEXTURES || !textureSlots[slotIndex].isLoaded) {
        return;
    }
    
    UnloadTexture(textureSlots[slotIndex].texture);
    textureSlots[slotIndex].isLoaded = false;
    textureSlots[slotIndex].texture = (Texture2D){0};
    memset(textureSlots[slotIndex].fileName, 0, 256);
}

// Draw texture by slot index
EXPORT void DrawTextureBySlot(int slotIndex, int posX, int posY, Color tint) {
    if (slotIndex < 0 || slotIndex >= MAX_TEXTURES || !textureSlots[slotIndex].isLoaded) {
        return;
    }
    
    DrawTexture(textureSlots[slotIndex].texture, posX, posY, tint);
}

// Draw texture with rotation and scale
EXPORT void DrawTextureProBySlot(int slotIndex, float posX, float posY, float originX, float originY, float rotation, float scale, Color tint) {
    if (slotIndex < 0 || slotIndex >= MAX_TEXTURES || !textureSlots[slotIndex].isLoaded) {
        return;
    }
    
    Rectangle source = { 0, 0, (float)textureSlots[slotIndex].texture.width, (float)textureSlots[slotIndex].texture.height };
    Rectangle dest = { posX, posY, textureSlots[slotIndex].texture.width * scale, textureSlots[slotIndex].texture.height * scale };
    Vector2 origin = { originX, originY };
    
    DrawTexturePro(textureSlots[slotIndex].texture, source, dest, origin, rotation, tint);
}

// Get number of loaded textures
EXPORT int GetLoadedTextureCount() {
    int count = 0;
    for (int i = 0; i < MAX_TEXTURES; i++) {
        if (textureSlots[i].isLoaded) {
            count++;
        }
    }
    return count;
}

// Unload all textures
EXPORT void UnloadAllTextures() {
    for (int i = 0; i < MAX_TEXTURES; i++) {
        if (textureSlots[i].isLoaded) {
            UnloadTextureBySlot(i);
        }
    }
}