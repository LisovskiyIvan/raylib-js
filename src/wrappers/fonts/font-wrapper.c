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

#define MAX_FONTS 32

// Font storage with metadata
typedef struct {
  Font font;
  bool isLoaded;
  int baseSize;
  int glyphCount;
} FontSlot;

static FontSlot fontSlots[MAX_FONTS] = {0};

// Helper function to convert uint32 color to Color struct
static Color ColorFromU32(unsigned int color) {
  return (Color){
      (unsigned char)((color >> 24) & 0xFF), // R
      (unsigned char)((color >> 16) & 0xFF), // G
      (unsigned char)((color >> 8) & 0xFF),  // B
      (unsigned char)(color & 0xFF)          // A
  };
}

// Find free slot for new font
static int FindFreeFontSlot() {
  for (int i = 0; i < MAX_FONTS; i++) {
    if (!fontSlots[i].isLoaded) {
      return i;
    }
  }
  return -1; // No free slots
}
// Load font and return slot index
EXPORT int LoadFontToSlot(const char *fileName, int fontSize) {
  if (fileName == NULL || fontSize <= 0) {
    return -1; // Invalid parameters
  }

  int slotIndex = FindFreeFontSlot();
  if (slotIndex == -1) {
    return -1; // No free slots
  }

  Font font = LoadFontEx(fileName, fontSize, NULL, 0);
  if (font.texture.id == 0) {
    return -1; // Failed to load
  }

  fontSlots[slotIndex].font = font;
  fontSlots[slotIndex].isLoaded = true;
  fontSlots[slotIndex].baseSize = font.baseSize;
  fontSlots[slotIndex].glyphCount = font.glyphCount;

  return slotIndex;
}

// Unload font by slot index
EXPORT void UnloadFontBySlot(int slotIndex) {
  if (slotIndex < 0 || slotIndex >= MAX_FONTS ||
      !fontSlots[slotIndex].isLoaded) {
    return;
  }

  UnloadFont(fontSlots[slotIndex].font);
  fontSlots[slotIndex].isLoaded = false;
  fontSlots[slotIndex].font = (Font){0};
  fontSlots[slotIndex].baseSize = 0;
  fontSlots[slotIndex].glyphCount = 0;
}

// Check if font slot is valid
EXPORT bool IsFontSlotValid(int slotIndex) {
  if (slotIndex < 0 || slotIndex >= MAX_FONTS) {
    return false;
  }
  return fontSlots[slotIndex].isLoaded;
}

// Get number of loaded fonts
EXPORT int GetLoadedFontCount() {
  int count = 0;
  for (int i = 0; i < MAX_FONTS; i++) {
    if (fontSlots[i].isLoaded) {
      count++;
    }
  }
  return count;
}

// Unload all fonts
EXPORT void UnloadAllFonts() {
  for (int i = 0; i < MAX_FONTS; i++) {
    if (fontSlots[i].isLoaded) {
      UnloadFontBySlot(i);
    }
  }
}
// Get font data by slot index (returns baseSize and glyphCount in outBuffer)
EXPORT void GetFontDataBySlot(int slotIndex, int *outBuffer) {
  if (slotIndex < 0 || slotIndex >= MAX_FONTS ||
      !fontSlots[slotIndex].isLoaded || outBuffer == NULL) {
    if (outBuffer != NULL) {
      outBuffer[0] = 0;
      outBuffer[1] = 0;
    }
    return;
  }

  outBuffer[0] = fontSlots[slotIndex].baseSize;
  outBuffer[1] = fontSlots[slotIndex].glyphCount;
}

// Get font base size
EXPORT int GetFontBaseSize(int slotIndex) {
  if (slotIndex < 0 || slotIndex >= MAX_FONTS ||
      !fontSlots[slotIndex].isLoaded) {
    return 0;
  }
  return fontSlots[slotIndex].baseSize;
}

// Get font glyph count
EXPORT int GetFontGlyphCount(int slotIndex) {
  if (slotIndex < 0 || slotIndex >= MAX_FONTS ||
      !fontSlots[slotIndex].isLoaded) {
    return 0;
  }
  return fontSlots[slotIndex].glyphCount;
}
// Measure text by slot index (returns width and height in outBuffer)
EXPORT void MeasureTextBySlot(int slotIndex, const char *text, float fontSize,
                              float spacing, float *outBuffer) {
  if (slotIndex < 0 || slotIndex >= MAX_FONTS ||
      !fontSlots[slotIndex].isLoaded || text == NULL || outBuffer == NULL ||
      fontSize <= 0) {
    if (outBuffer != NULL) {
      outBuffer[0] = 0.0f;
      outBuffer[1] = 0.0f;
    }
    return;
  }

  // Handle empty text strings
  if (text[0] == '\0') {
    outBuffer[0] = 0.0f;
    outBuffer[1] = 0.0f;
    return;
  }

  Vector2 measurement =
      MeasureTextEx(fontSlots[slotIndex].font, text, fontSize, spacing);
  outBuffer[0] = measurement.x;
  outBuffer[1] = measurement.y;
}
// Draw text by slot index
EXPORT void DrawTextBySlot(int slotIndex, const char *text, float posX,
                           float posY, float fontSize, float spacing,
                           unsigned int color) {
  if (slotIndex < 0 || slotIndex >= MAX_FONTS ||
      !fontSlots[slotIndex].isLoaded || text == NULL || fontSize <= 0) {
    return;
  }

  // Handle empty text strings
  if (text[0] == '\0') {
    return;
  }

  Vector2 position = {posX, posY};
  Color tint = ColorFromU32(color);

  DrawTextEx(fontSlots[slotIndex].font, text, position, fontSize, spacing,
             tint);
}
// Wrap text by slot index
EXPORT int WrapTextBySlot(int slotIndex, const char *text, float fontSize,
                          float spacing, float maxWidth, char *outBuffer,
                          int bufferSize) {
  if (slotIndex < 0 || slotIndex >= MAX_FONTS ||
      !fontSlots[slotIndex].isLoaded || text == NULL || outBuffer == NULL ||
      fontSize <= 0 || maxWidth <= 0 || bufferSize <= 0) {
    return -1;
  }

  // Handle empty text strings
  if (text[0] == '\0') {
    outBuffer[0] = '\0';
    return 0;
  }

  Font font = fontSlots[slotIndex].font;
  int lineCount = 0;
  int outIndex = 0;
  int textLen = strlen(text);
  int i = 0;

  float currentLineWidth = 0.0f;
  int lineStartIndex = 0;

  while (i < textLen && outIndex < bufferSize - 1) {
    // Handle explicit line breaks
    if (text[i] == '\n') {
      // Copy the line to output
      int lineLen = i - lineStartIndex;
      if (outIndex + lineLen + 1 < bufferSize) {
        memcpy(outBuffer + outIndex, text + lineStartIndex, lineLen);
        outIndex += lineLen;
        outBuffer[outIndex++] = '\n';
        lineCount++;
      }
      lineStartIndex = i + 1;
      currentLineWidth = 0.0f;
      i++;
      continue;
    }

    // Find the next word boundary (space or end of text)
    int wordStart = i;
    while (i < textLen && text[i] != ' ' && text[i] != '\n') {
      i++;
    }
    int wordEnd = i;

    // Measure the word
    char wordBuffer[256];
    int wordLen = wordEnd - wordStart;
    if (wordLen >= 256)
      wordLen = 255;
    memcpy(wordBuffer, text + wordStart, wordLen);
    wordBuffer[wordLen] = '\0';

    Vector2 wordSize = MeasureTextEx(font, wordBuffer, fontSize, spacing);

    // Check if adding this word would exceed maxWidth
    if (currentLineWidth > 0 && currentLineWidth + wordSize.x > maxWidth) {
      // Start a new line
      if (outIndex > 0 && outBuffer[outIndex - 1] == ' ') {
        outIndex--; // Remove trailing space
      }
      if (outIndex < bufferSize - 1) {
        outBuffer[outIndex++] = '\n';
        lineCount++;
      }
      currentLineWidth = 0.0f;
      lineStartIndex = wordStart;
    }

    // If the word itself is too long, break it at character boundaries
    if (wordSize.x > maxWidth) {
      for (int j = wordStart; j < wordEnd && outIndex < bufferSize - 1; j++) {
        char charBuffer[2] = {text[j], '\0'};
        Vector2 charSize = MeasureTextEx(font, charBuffer, fontSize, spacing);

        if (currentLineWidth + charSize.x > maxWidth && currentLineWidth > 0) {
          outBuffer[outIndex++] = '\n';
          lineCount++;
          currentLineWidth = 0.0f;
        }

        outBuffer[outIndex++] = text[j];
        currentLineWidth += charSize.x;
      }
    } else {
      // Add the word to the current line
      if (outIndex + wordLen < bufferSize) {
        memcpy(outBuffer + outIndex, wordBuffer, wordLen);
        outIndex += wordLen;
        currentLineWidth += wordSize.x;
      }
    }

    // Add space after word if there is one
    if (i < textLen && text[i] == ' ') {
      Vector2 spaceSize = MeasureTextEx(font, " ", fontSize, spacing);
      if (outIndex < bufferSize - 1) {
        outBuffer[outIndex++] = ' ';
        currentLineWidth += spaceSize.x;
      }
      i++;
    }
  }

  // Null-terminate the output
  outBuffer[outIndex] = '\0';

  // Count the final line if there's content
  if (outIndex > 0 && outBuffer[outIndex - 1] != '\n') {
    lineCount++;
  }

  return lineCount;
}
