#include "raylib.h"
#include <stdlib.h>
#include <string.h>

// Wrapper functions for ray collision detection
// These functions return collision data through individual component getters

// Static storage for last collision result
static RayCollision lastCollision = {0};

// Get ray collision with sphere
void GetRayCollisionSphereWrapper(Ray ray, Vector3 center, float radius, float* outBuffer) {
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
void GetRayCollisionBoxWrapper(Ray ray, BoundingBox box, float* outBuffer) {
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
void GetRayCollisionTriangleWrapper(Ray ray, Vector3 p1, Vector3 p2, Vector3 p3, float* outBuffer) {
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

bool GetLastCollisionHit() {
    return lastCollision.hit;
}

float GetLastCollisionDistance() {
    return lastCollision.distance;
}

float GetLastCollisionPointX() {
    return lastCollision.point.x;
}

float GetLastCollisionPointY() {
    return lastCollision.point.y;
}

float GetLastCollisionPointZ() {
    return lastCollision.point.z;
}

float GetLastCollisionNormalX() {
    return lastCollision.normal.x;
}

float GetLastCollisionNormalY() {
    return lastCollision.normal.y;
}

float GetLastCollisionNormalZ() {
    return lastCollision.normal.z;
}

void GetLastCollisionData(float* outBuffer) {
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
