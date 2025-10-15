#include "raylib.h"
#include <stdlib.h>

// Wrapper functions for ray collision detection
// These functions return collision data through individual component getters

// Static storage for last collision result
static RayCollision lastCollision = {0};

// Get ray collision with sphere
void GetRayCollisionSphereWrapper(Ray ray, Vector3 center, float radius) {
    lastCollision = GetRayCollisionSphere(ray, center, radius);
}

// Get ray collision with box
void GetRayCollisionBoxWrapper(Ray ray, BoundingBox box) {
    lastCollision = GetRayCollisionBox(ray, box);
}

// Get ray collision with triangle
void GetRayCollisionTriangleWrapper(Ray ray, Vector3 p1, Vector3 p2, Vector3 p3) {
    lastCollision = GetRayCollisionTriangle(ray, p1, p2, p3);
}

// Getters for RayCollision components
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
