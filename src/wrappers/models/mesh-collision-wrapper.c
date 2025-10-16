#include "raylib.h"
#include "raymath.h"
#include <stdlib.h>

// Thread-local storage for last collision result
static RayCollision lastCollision = {0};

// Wrapper for GetRayCollisionMesh that stores result in thread-local storage
void GetRayCollisionMeshWrapper(Ray* ray, int modelSlotIndex, int meshIndex, Matrix* transform) {
    // This function needs access to the model slots from model-wrapper.c
    // We'll need to expose a function to get mesh data
    // For now, we'll implement a simpler version that works with the existing system
    
    // Reset last collision
    lastCollision = (RayCollision){0};
    
    // Note: This is a placeholder - actual implementation needs model slot access
    // The proper way is to add a function in model-wrapper.c that exposes mesh data
}

// Alternative: Direct ray-mesh collision with explicit mesh data
void GetRayCollisionMeshDirect(Ray* ray, float* vertices, int vertexCount, unsigned short* indices, int triangleCount, Matrix* transform, RayCollision* outCollision) {
    RayCollision collision = {0};
    collision.distance = 10000.0f;
    collision.hit = false;
    
    // Transform ray to model space if transform is provided
    Ray localRay = *ray;
    if (transform != NULL) {
        Matrix invTransform = MatrixInvert(*transform);
        localRay.position = Vector3Transform(ray->position, invTransform);
        localRay.direction = Vector3Transform(ray->direction, invTransform);
        localRay.direction = Vector3Normalize(localRay.direction);
    }
    
    // Check collision with each triangle
    for (int i = 0; i < triangleCount; i++) {
        int idx0 = indices ? indices[i * 3 + 0] : (i * 3 + 0);
        int idx1 = indices ? indices[i * 3 + 1] : (i * 3 + 1);
        int idx2 = indices ? indices[i * 3 + 2] : (i * 3 + 2);
        
        Vector3 v0 = { vertices[idx0 * 3 + 0], vertices[idx0 * 3 + 1], vertices[idx0 * 3 + 2] };
        Vector3 v1 = { vertices[idx1 * 3 + 0], vertices[idx1 * 3 + 1], vertices[idx1 * 3 + 2] };
        Vector3 v2 = { vertices[idx2 * 3 + 0], vertices[idx2 * 3 + 1], vertices[idx2 * 3 + 2] };
        
        RayCollision triCollision = GetRayCollisionTriangle(localRay, v0, v1, v2);
        
        if (triCollision.hit && triCollision.distance < collision.distance) {
            collision = triCollision;
        }
    }
    
    // Transform collision point and normal back to world space if needed
    if (collision.hit && transform != NULL) {
        collision.point = Vector3Transform(collision.point, *transform);
        collision.normal = Vector3Transform(collision.normal, *transform);
        collision.normal = Vector3Normalize(collision.normal);
    }
    
    *outCollision = collision;
    lastCollision = collision;
}

// Get last collision data (for compatibility with existing system)
void GetLastMeshCollisionData(float* outBuffer) {
    outBuffer[0] = lastCollision.hit ? 1.0f : 0.0f;
    outBuffer[1] = lastCollision.distance;
    outBuffer[2] = lastCollision.point.x;
    outBuffer[3] = lastCollision.point.y;
    outBuffer[4] = lastCollision.point.z;
    outBuffer[5] = lastCollision.normal.x;
    outBuffer[6] = lastCollision.normal.y;
    outBuffer[7] = lastCollision.normal.z;
}
