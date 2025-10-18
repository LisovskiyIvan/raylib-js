#include "raylib.h"
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
// Wrapper functions for ray collision detection
// These functions return collision data through individual component getters

// Static storage for last collision result
static RayCollision lastCollision = {0};

// Get ray collision with sphere
EXPORT void GetRayCollisionSphereWrapper(Ray ray, Vector3 center, float radius, float* outBuffer) {
    if (outBuffer == NULL) return;
    lastCollision = GetRayCollisionSphere(ray, center, radius);
    
    // Copy as floats (bool will be 0.0 or 1.0)
    outBuffer[0] = lastCollision.hit ? 1.0f : 0.0f;
    outBuffer[1] = lastCollision.distance;
    outBuffer[2] = lastCollision.point.x;
    outBuffer[3] = lastCollision.point.y;
    outBuffer[4] = lastCollision.point.z;
    outBuffer[5] = lastCollision.normal.x;
    outBuffer[6] = lastCollision.normal.y;
    outBuffer[7] = lastCollision.normal.z;
}

// Get ray collision with box
EXPORT void GetRayCollisionBoxWrapper(Ray ray, BoundingBox box, float* outBuffer) {
    if (outBuffer == NULL) return;
    lastCollision = GetRayCollisionBox(ray, box);
    
    // Copy as floats (bool will be 0.0 or 1.0)
    outBuffer[0] = lastCollision.hit ? 1.0f : 0.0f;
    outBuffer[1] = lastCollision.distance;
    outBuffer[2] = lastCollision.point.x;
    outBuffer[3] = lastCollision.point.y;
    outBuffer[4] = lastCollision.point.z;
    outBuffer[5] = lastCollision.normal.x;
    outBuffer[6] = lastCollision.normal.y;
    outBuffer[7] = lastCollision.normal.z;
}

// Get ray collision with triangle
EXPORT void GetRayCollisionTriangleWrapper(Ray ray, Vector3 p1, Vector3 p2, Vector3 p3, float* outBuffer) {
    if (outBuffer == NULL) return;
    lastCollision = GetRayCollisionTriangle(ray, p1, p2, p3);

    // Copy as floats (bool will be 0.0 or 1.0)
    outBuffer[0] = lastCollision.hit ? 1.0f : 0.0f;
    outBuffer[1] = lastCollision.distance;
    outBuffer[2] = lastCollision.point.x;
    outBuffer[3] = lastCollision.point.y;
    outBuffer[4] = lastCollision.point.z;
    outBuffer[5] = lastCollision.normal.x;
    outBuffer[6] = lastCollision.normal.y;
    outBuffer[7] = lastCollision.normal.z;
}

EXPORT bool GetLastCollisionHit() {
    return lastCollision.hit;
}

EXPORT float GetLastCollisionDistance() {
    return lastCollision.distance;
}

EXPORT float GetLastCollisionPointX() {
    return lastCollision.point.x;
}

EXPORT float GetLastCollisionPointY() {
    return lastCollision.point.y;
}

EXPORT float GetLastCollisionPointZ() {
    return lastCollision.point.z;
}

EXPORT float GetLastCollisionNormalX() {
    return lastCollision.normal.x;
}

EXPORT float GetLastCollisionNormalY() {
    return lastCollision.normal.y;
}

EXPORT float GetLastCollisionNormalZ() {
    return lastCollision.normal.z;
}

EXPORT void GetLastCollisionData(float* outBuffer) {
    if (outBuffer == NULL) return;
    
    // Copy as floats (bool will be 0.0 or 1.0)
    outBuffer[0] = lastCollision.hit ? 1.0f : 0.0f;
    outBuffer[1] = lastCollision.distance;
    outBuffer[2] = lastCollision.point.x;
    outBuffer[3] = lastCollision.point.y;
    outBuffer[4] = lastCollision.point.z;
    outBuffer[5] = lastCollision.normal.x;
    outBuffer[6] = lastCollision.normal.y;
    outBuffer[7] = lastCollision.normal.z;
}
