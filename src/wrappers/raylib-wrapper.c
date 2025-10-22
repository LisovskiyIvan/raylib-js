#include "raylib.h"

// Export macro for Windows DLL
#ifdef _WIN32
#define EXPORT __declspec(dllexport)
#else
#define EXPORT
#endif

// Window management functions
EXPORT void InitWindowWrapper(int width, int height, const char *title) {
  InitWindow(width, height, title);
}

EXPORT void CloseWindowWrapper(void) { CloseWindow(); }

EXPORT bool WindowShouldCloseWrapper(void) { return WindowShouldClose(); }

// Drawing functions
EXPORT void BeginDrawingWrapper(void) { BeginDrawing(); }

EXPORT void EndDrawingWrapper(void) { EndDrawing(); }

// Helper function to convert uint32 color to Color struct
// Format: 0xAABBGGRR (little-endian)
static Color ColorFromU32(unsigned int hexValue) {
  Color color;
  color.r = (unsigned char)(hexValue & 0xFF);
  color.g = (unsigned char)((hexValue >> 8) & 0xFF);
  color.b = (unsigned char)((hexValue >> 16) & 0xFF);
  color.a = (unsigned char)((hexValue >> 24) & 0xFF);
  return color;
}

EXPORT void ClearBackgroundWrapper(unsigned int color) {
  Color c = ColorFromU32(color);
  ClearBackground(c);
}

EXPORT void DrawTextWrapper(const char *text, int posX, int posY, int fontSize,
                            unsigned int color) {
  Color c = ColorFromU32(color);
  DrawText(text, posX, posY, fontSize, c);
}

EXPORT void DrawRectangleWrapper(int posX, int posY, int width, int height,
                                 unsigned int color) {
  Color c = ColorFromU32(color);
  DrawRectangle(posX, posY, width, height, c);
}

EXPORT void SetTargetFPSWrapper(int fps) { SetTargetFPS(fps); }

EXPORT void DrawFPSWrapper(int posX, int posY) { DrawFPS(posX, posY); }

EXPORT float GetFrameTimeWrapper(void) { return GetFrameTime(); }

// Input functions - Keyboard
EXPORT bool IsKeyDownWrapper(short key) { return IsKeyDown((int)key); }

EXPORT bool IsKeyUpWrapper(short key) { return IsKeyUp((int)key); }

EXPORT char GetKeyPressedWrapper(void) { return (char)GetKeyPressed(); }

// Input functions - Mouse
EXPORT bool IsMouseButtonDownWrapper(int button) {
  return IsMouseButtonDown(button);
}

EXPORT bool IsMouseButtonUpWrapper(int button) {
  return IsMouseButtonUp(button);
}

EXPORT int GetMouseXWrapper(void) { return GetMouseX(); }

EXPORT int GetMouseYWrapper(void) { return GetMouseY(); }

EXPORT void SetMousePositionWrapper(int x, int y) { SetMousePosition(x, y); }

// Cursor functions
EXPORT void DisableCursorWrapper(void) { DisableCursor(); }

EXPORT void EnableCursorWrapper(void) { EnableCursor(); }

EXPORT void HideCursorWrapper(void) { HideCursor(); }

EXPORT void ShowCursorWrapper(void) { ShowCursor(); }

EXPORT bool IsCursorHiddenWrapper(void) { return IsCursorHidden(); }

// 2D Drawing shapes
EXPORT void DrawPixelWrapper(short posX, short posY, unsigned int color) {
  Color c = ColorFromU32(color);
  DrawPixel((int)posX, (int)posY, c);
}

EXPORT void DrawLineWrapper(short startPosX, short startPosY, short endPosX,
                            short endPosY, unsigned int color) {
  Color c = ColorFromU32(color);
  DrawLine((int)startPosX, (int)startPosY, (int)endPosX, (int)endPosY, c);
}

EXPORT void DrawCircleWrapper(short centerX, short centerY, float radius,
                              unsigned int color) {
  Color c = ColorFromU32(color);
  DrawCircle((int)centerX, (int)centerY, radius, c);
}

EXPORT void DrawPolyWrapper(float centerX, float centerY, int sides,
                            float radius, float rotation, unsigned int color) {
  Color c = ColorFromU32(color);
  Vector2 centerVec = {centerX, centerY};
  DrawPoly(centerVec, sides, radius, rotation, c);
}

EXPORT void DrawTriangleFanWrapper(float *points, int pointCount,
                                   unsigned int color) {
  Color c = ColorFromU32(color);
  Vector2 *verts = (Vector2 *)points;
  DrawTriangleFan(verts, pointCount, c);
}

EXPORT void DrawRectangleProWrapper(float recX, float recY, float recWidth,
                                    float recHeight, float originX,
                                    float originY, float rotation,
                                    unsigned int color) {
  Color c = ColorFromU32(color);
  Rectangle rect = {recX, recY, recWidth, recHeight};
  Vector2 orig = {originX, originY};
  DrawRectanglePro(rect, orig, rotation, c);
}

// 2D Collision detection
EXPORT bool CheckCollisionRecsWrapper(float rec1X, float rec1Y, float rec1Width,
                                      float rec1Height, float rec2X,
                                      float rec2Y, float rec2Width,
                                      float rec2Height) {
  Rectangle r1 = {rec1X, rec1Y, rec1Width, rec1Height};
  Rectangle r2 = {rec2X, rec2Y, rec2Width, rec2Height};
  return CheckCollisionRecs(r1, r2);
}

EXPORT bool CheckCollisionCirclesWrapper(float center1X, float center1Y,
                                         float radius1, float center2X,
                                         float center2Y, float radius2) {
  Vector2 c1 = {center1X, center1Y};
  Vector2 c2 = {center2X, center2Y};
  return CheckCollisionCircles(c1, radius1, c2, radius2);
}

EXPORT bool CheckCollisionCircleRecWrapper(float centerX, float centerY,
                                           float radius, float recX, float recY,
                                           float recWidth, float recHeight) {
  Vector2 c = {centerX, centerY};
  Rectangle r = {recX, recY, recWidth, recHeight};
  return CheckCollisionCircleRec(c, radius, r);
}

EXPORT bool CheckCollisionCircleLineWrapper(float centerX, float centerY,
                                            float radius, float p1X, float p1Y,
                                            float p2X, float p2Y) {
  Vector2 c = {centerX, centerY};
  Vector2 point1 = {p1X, p1Y};
  Vector2 point2 = {p2X, p2Y};
  return CheckCollisionCircleLine(c, radius, point1, point2);
}

EXPORT bool CheckCollisionPointRecWrapper(float pointX, float pointY,
                                          float recX, float recY,
                                          float recWidth, float recHeight) {
  Vector2 p = {pointX, pointY};
  Rectangle r = {recX, recY, recWidth, recHeight};
  return CheckCollisionPointRec(p, r);
}

EXPORT bool CheckCollisionPointCircleWrapper(float pointX, float pointY,
                                             float centerX, float centerY,
                                             float radius) {
  Vector2 p = {pointX, pointY};
  Vector2 c = {centerX, centerY};
  return CheckCollisionPointCircle(p, c, radius);
}

EXPORT bool CheckCollisionPointTriangleWrapper(float pointX, float pointY,
                                               float p1X, float p1Y, float p2X,
                                               float p2Y, float p3X,
                                               float p3Y) {
  Vector2 pt = {pointX, pointY};
  Vector2 v1 = {p1X, p1Y};
  Vector2 v2 = {p2X, p2Y};
  Vector2 v3 = {p3X, p3Y};
  return CheckCollisionPointTriangle(pt, v1, v2, v3);
}

// 3D Drawing functions
EXPORT void DrawLine3DWrapper(float startX, float startY, float startZ,
                              float endX, float endY, float endZ,
                              unsigned int color) {
  Color c = ColorFromU32(color);
  Vector3 start = {startX, startY, startZ};
  Vector3 end = {endX, endY, endZ};
  DrawLine3D(start, end, c);
}

EXPORT void DrawPoint3DWrapper(float posX, float posY, float posZ,
                               unsigned int color) {
  Color c = ColorFromU32(color);
  Vector3 pos = {posX, posY, posZ};
  DrawPoint3D(pos, c);
}

EXPORT void DrawCircle3DWrapper(float centerX, float centerY, float centerZ,
                                float radius, float axisX, float axisY,
                                float axisZ, float rotationAngle,
                                unsigned int color) {
  Color c = ColorFromU32(color);
  Vector3 centerVec = {centerX, centerY, centerZ};
  Vector3 axis = {axisX, axisY, axisZ};
  DrawCircle3D(centerVec, radius, axis, rotationAngle, c);
}

EXPORT void DrawTriangle3DWrapper(float v1X, float v1Y, float v1Z, float v2X,
                                  float v2Y, float v2Z, float v3X, float v3Y,
                                  float v3Z, unsigned int color) {
  Color c = ColorFromU32(color);
  Vector3 vert1 = {v1X, v1Y, v1Z};
  Vector3 vert2 = {v2X, v2Y, v2Z};
  Vector3 vert3 = {v3X, v3Y, v3Z};
  DrawTriangle3D(vert1, vert2, vert3, c);
}

// Additional 3D shapes
EXPORT void DrawCubeWrapper(float posX, float posY, float posZ, float width,
                            float height, float length, unsigned int color) {
  Color c = ColorFromU32(color);
  Vector3 pos = {posX, posY, posZ};
  DrawCube(pos, width, height, length, c);
}

EXPORT void DrawCubeVWrapper(float posX, float posY, float posZ, float sizeX,
                             float sizeY, float sizeZ, unsigned int color) {
  Color c = ColorFromU32(color);
  Vector3 pos = {posX, posY, posZ};
  Vector3 sizeVec = {sizeX, sizeY, sizeZ};
  DrawCubeV(pos, sizeVec, c);
}

EXPORT void DrawSphereWrapper(float centerX, float centerY, float centerZ,
                              float radius, unsigned int color) {
  Color c = ColorFromU32(color);
  Vector3 center = {centerX, centerY, centerZ};
  DrawSphere(center, radius, c);
}

EXPORT void DrawCylinderWrapper(float posX, float posY, float posZ,
                                float radiusTop, float radiusBottom,
                                float height, int slices, unsigned int color) {
  Color c = ColorFromU32(color);
  Vector3 pos = {posX, posY, posZ};
  DrawCylinder(pos, radiusTop, radiusBottom, height, slices, c);
}

EXPORT void DrawCapsuleWrapper(float startX, float startY, float startZ,
                               float endX, float endY, float endZ, float radius,
                               int slices, int rings, unsigned int color) {
  Color c = ColorFromU32(color);
  Vector3 start = {startX, startY, startZ};
  Vector3 end = {endX, endY, endZ};
  DrawCapsule(start, end, radius, slices, rings, c);
}

EXPORT void DrawPlaneWrapper(float centerX, float centerY, float centerZ,
                             float sizeX, float sizeY, unsigned int color) {
  Color c = ColorFromU32(color);
  Vector3 center = {centerX, centerY, centerZ};
  Vector2 sizeVec = {sizeX, sizeY};
  DrawPlane(center, sizeVec, c);
}

EXPORT void DrawRayWrapper(float posX, float posY, float posZ, float dirX,
                           float dirY, float dirZ, unsigned int color) {
  Color c = ColorFromU32(color);
  Ray r = {
      {posX, posY, posZ}, // position
      {dirX, dirY, dirZ}  // direction
  };
  DrawRay(r, c);
}

EXPORT void DrawGridWrapper(int slices, float spacing) {
  DrawGrid(slices, spacing);
}

// 3D Collision detection
EXPORT bool CheckCollisionSpheresWrapper(float center1X, float center1Y,
                                         float center1Z, float radius1,
                                         float center2X, float center2Y,
                                         float center2Z, float radius2) {
  Vector3 c1 = {center1X, center1Y, center1Z};
  Vector3 c2 = {center2X, center2Y, center2Z};
  return CheckCollisionSpheres(c1, radius1, c2, radius2);
}

EXPORT bool CheckCollisionBoxesWrapper(float box1MinX, float box1MinY,
                                       float box1MinZ, float box1MaxX,
                                       float box1MaxY, float box1MaxZ,
                                       float box2MinX, float box2MinY,
                                       float box2MinZ, float box2MaxX,
                                       float box2MaxY, float box2MaxZ) {
  BoundingBox b1 = {
      {box1MinX, box1MinY, box1MinZ}, // min
      {box1MaxX, box1MaxY, box1MaxZ}  // max
  };
  BoundingBox b2 = {
      {box2MinX, box2MinY, box2MinZ}, // min
      {box2MaxX, box2MaxY, box2MaxZ}  // max
  };
  return CheckCollisionBoxes(b1, b2);
}

EXPORT bool CheckCollisionBoxSphereWrapper(float boxMinX, float boxMinY,
                                           float boxMinZ, float boxMaxX,
                                           float boxMaxY, float boxMaxZ,
                                           float centerX, float centerY,
                                           float centerZ, float radius) {
  BoundingBox b = {
      {boxMinX, boxMinY, boxMinZ}, // min
      {boxMaxX, boxMaxY, boxMaxZ}  // max
  };
  Vector3 c = {centerX, centerY, centerZ};
  return CheckCollisionBoxSphere(b, c, radius);
}

// 3D Camera functions
EXPORT void BeginMode3DWrapper(float posX, float posY, float posZ,
                               float targetX, float targetY, float targetZ,
                               float upX, float upY, float upZ, float fovy,
                               int projection) {
  Camera3D cam = {
      {posX, posY, posZ},          // position
      {targetX, targetY, targetZ}, // target
      {upX, upY, upZ},             // up
      fovy,                        // fovy
      projection                   // projection
  };
  BeginMode3D(cam);
}

EXPORT void EndMode3DWrapper(void) { EndMode3D(); }
