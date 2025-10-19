#include "raylib.h"
#include "raymath.h"
#include <stdlib.h>
#include <math.h>

// Export macro for Windows DLL
#ifdef _WIN32
    #define EXPORT __declspec(dllexport)
#else
    #define EXPORT
#endif

// Wrapper that tries multiple methods for maximum compatibility
EXPORT void DrawTriangleWrapper(float x1, float y1, float x2, float y2, float x3, float y3, Color color) {
    // Method 1: Try native DrawTriangle
    Vector2 v1 = {x1, y1};
    Vector2 v2 = {x2, y2};
    Vector2 v3 = {x3, y3};
    
    DrawTriangle(v1, v2, v3, color);
}


// TODO: implement proper triangle fun wrapper
EXPORT void DrawTriangleFanWrapper(float x1, float y1, float x2, float y2, float x3, float y3, Color color) {
    Vector2 points[3] = {
        {x1, y1},
        {x2, y2},
        {x3, y3}
    };
    
    DrawTriangleFan(points, 3, color);
}

EXPORT Color IntToColor(unsigned int colorInt) {
    Color color;
    color.r = colorInt & 0xFF;           // Red is in the lowest byte
    color.g = (colorInt >> 8) & 0xFF;   // Green is in the second byte
    color.b = (colorInt >> 16) & 0xFF;  // Blue is in the third byte
    color.a = (colorInt >> 24) & 0xFF;  // Alpha is in the highest byte
    return color;
}
