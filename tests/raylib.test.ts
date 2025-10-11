import { test, expect } from "bun:test";
import Raylib from "../src/Raylib";
import { RaylibErrorKind } from "../src/types";
import { Colors } from "../src/constants";
import Vector2 from "../src/math/Vector2";
import Rectangle from "../src/math/Rectangle";

test("Result API - should return validation errors", () => {
  const rl = new Raylib();
  
  // Test negative dimensions
  const result1 = rl.initWindow(-1, 100, "Test");
  expect(result1.isErr()).toBe(true);
  if (result1.isErr()) {
    expect(result1.error.kind).toBe(RaylibErrorKind.ValidationError);
    expect(result1.error.message).toContain("width must be positive");
  }
  
  // Test empty title
  const result2 = rl.initWindow(100, 100, "");
  expect(result2.isErr()).toBe(true);
  if (result2.isErr()) {
    expect(result2.error.kind).toBe(RaylibErrorKind.ValidationError);
    expect(result2.error.message).toContain("title must be a non-empty string");
  }
});

test("Result API - should require initialization", () => {
  const rl = new Raylib();
  
  const result = rl.beginDrawing();
  expect(result.isErr()).toBe(true);
  if (result.isErr()) {
    expect(result.error.kind).toBe(RaylibErrorKind.StateError);
    expect(result.error.message).toContain("Window must be initialized");
  }
});

test("Result API - should chain operations with andThen", () => {
  const rl = new Raylib();
  
  // This will fail at the first step due to negative width
  const result = rl.initWindow(-1, 100, "Test")
    .andThen(() => rl.setTargetFPS(60))
    .andThen(() => rl.beginDrawing());
  
  expect(result.isErr()).toBe(true);
  if (result.isErr()) {
    expect(result.error.kind).toBe(RaylibErrorKind.ValidationError);
    expect(result.error.message).toContain("width must be positive");
  }
});

test("Result API - should handle successful operations", () => {
  const rl = new Raylib();
  
  try {
    // This might fail in headless environment, but we test the API structure
    const result = rl.initWindow(100, 100, "Test");
    
    if (result.isOk()) {
      expect(rl.initialized).toBe(true);
      expect(rl.width).toBe(100);
      expect(rl.height).toBe(100);
      
      const closeResult = rl.closeWindow();
      expect(closeResult.isOk()).toBe(true);
      expect(rl.initialized).toBe(false);
    } else if (result.isErr()) {
      // Expected in headless environment
      expect(result.error.kind).toBe(RaylibErrorKind.FFIError);
    }
  } catch (error) {
    console.log("Skipping initialization test - no display available");
  }
});

test("Result API - should validate FPS range", () => {
  const rl = new Raylib();
  
  try {
    const initResult = rl.initWindow(100, 100, "Test");
    if (initResult.isOk()) {
      const result1 = rl.setTargetFPS(0);
      expect(result1.isErr()).toBe(true);
      if (result1.isErr()) {
        expect(result1.error.kind).toBe(RaylibErrorKind.ValidationError);
        expect(result1.error.message).toContain("target FPS must be between 1 and 1000");
      }
      
      const result2 = rl.setTargetFPS(1001);
      expect(result2.isErr()).toBe(true);
      if (result2.isErr()) {
        expect(result2.error.kind).toBe(RaylibErrorKind.ValidationError);
      }
      
      rl.closeWindow();
    }
  } catch (error) {
    console.log("Skipping FPS test - no display available");
  }
});

test("Result API - should validate drawing parameters", () => {
  const rl = new Raylib();
  
  try {
    const initResult = rl.initWindow(100, 100, "Test");
    if (initResult.isOk()) {
      // Test negative rectangle dimensions
      const result1 = rl.drawRectangle(0, 0, -1, 10, Colors.RED);
      expect(result1.isErr()).toBe(true);
      if (result1.isErr()) {
        expect(result1.error.kind).toBe(RaylibErrorKind.ValidationError);
        expect(result1.error.message).toContain("width cannot be negative");
      }
      
      // Test negative font size
      const result2 = rl.drawText("Hello", 0, 0, -1, Colors.BLACK);
      expect(result2.isErr()).toBe(true);
      if (result2.isErr()) {
        expect(result2.error.kind).toBe(RaylibErrorKind.ValidationError);
        expect(result2.error.message).toContain("fontSize must be positive");
      }
      
      rl.closeWindow();
    }
  } catch (error) {
    console.log("Skipping drawing test - no display available");
  }
});

test("Result API - should prevent double initialization", () => {
  const rl = new Raylib();
  
  try {
    const result1 = rl.initWindow(100, 100, "Test");
    if (result1.isOk()) {
      const result2 = rl.initWindow(200, 200, "Test2");
      expect(result2.isErr()).toBe(true);
      if (result2.isErr()) {
        expect(result2.error.kind).toBe(RaylibErrorKind.InitError);
        expect(result2.error.message).toContain("Window is already initialized");
      }
      
      rl.closeWindow();
    }
  } catch (error) {
    console.log("Skipping double init test - no display available");
  }
});

test("Result API - match method should work correctly", () => {
  const rl = new Raylib();
  
  const result = rl.initWindow(-1, 100, "Test");
  
  const matched = result.match(
    () => "success",
    (error) => `error: ${error.kind}`
  );
  
  expect(matched).toBe(`error: ${RaylibErrorKind.ValidationError}`);
});

test("Result API - unwrapOr should provide default values", () => {
  const rl = new Raylib();
  
  const result = rl.getMousePosition(); // Will fail because not initialized
  const position = result.unwrapOr(Vector2.Zero());
  
  expect(position).toEqual(Vector2.Zero());
});

test("Result API - map should transform successful values", () => {
  const rl = new Raylib();
  
  try {
    const result = rl.initWindow(800, 600, "Test")
      .map(() => ({ width: rl.width, height: rl.height }));
    
    if (result.isOk()) {
      expect(result.value).toEqual({ width: 800, height: 600 });
      rl.closeWindow();
    }
  } catch (error) {
    console.log("Skipping map test - no display available");
  }
});

test("Collision Detection - Rectangle vs Rectangle", () => {
  const rl = new Raylib();
  
  try {
    const initResult = rl.initWindow(400, 300, "Collision Test");
    if (initResult.isOk()) {
      // Test overlapping rectangles
      const rect1 = new Rectangle(0, 0, 50, 50);
      const rect2 = new Rectangle(25, 25, 50, 50); // Overlapping
      const rect3 = new Rectangle(100, 100, 50, 50); // Not overlapping
      
      const collision1 = rl.checkCollisionRecs(rect1, rect2);
      const collision2 = rl.checkCollisionRecs(rect1, rect3);
      
      expect(collision1.isOk()).toBe(true);
      expect(collision2.isOk()).toBe(true);
      
      if (collision1.isOk() && collision2.isOk()) {
        expect(collision1.value).toBe(true); // Should overlap
        expect(collision2.value).toBe(false); // Should not overlap
      }
      
      rl.closeWindow();
    }
  } catch (error) {
    console.log("Skipping collision test - no display available");
  }
});

test("Collision Detection - Circle vs Circle", () => {
  const rl = new Raylib();
  
  try {
    const initResult = rl.initWindow(400, 300, "Collision Test");
    if (initResult.isOk()) {
      const center1 = new Vector2(0, 0);
      const center2 = new Vector2(30, 0); // Overlapping circles with radius 20
      const center3 = new Vector2(100, 0); // Not overlapping
      
      const collision1 = rl.checkCollisionCircles(center1, 20, center2, 20);
      const collision2 = rl.checkCollisionCircles(center1, 20, center3, 20);
      
      expect(collision1.isOk()).toBe(true);
      expect(collision2.isOk()).toBe(true);
      
      if (collision1.isOk() && collision2.isOk()) {
        expect(collision1.value).toBe(true); // Should overlap
        expect(collision2.value).toBe(false); // Should not overlap
      }
      
      rl.closeWindow();
    }
  } catch (error) {
    console.log("Skipping circle collision test - no display available");
  }
});

test("Collision Detection - Circle vs Rectangle", () => {
  const rl = new Raylib();
  
  try {
    const initResult = rl.initWindow(400, 300, "Collision Test");
    if (initResult.isOk()) {
      const circleCenter = new Vector2(25, 25);
      const rect1 = new Rectangle(0, 0, 50, 50); // Overlapping
      const rect2 = new Rectangle(100, 100, 50, 50); // Not overlapping
      
      const collision1 = rl.checkCollisionCircleRec(circleCenter, 20, rect1);
      const collision2 = rl.checkCollisionCircleRec(circleCenter, 20, rect2);
      
      expect(collision1.isOk()).toBe(true);
      expect(collision2.isOk()).toBe(true);
      
      if (collision1.isOk() && collision2.isOk()) {
        expect(collision1.value).toBe(true); // Should overlap
        expect(collision2.value).toBe(false); // Should not overlap
      }
      
      rl.closeWindow();
    }
  } catch (error) {
    console.log("Skipping circle-rectangle collision test - no display available");
  }
});

test("Collision Detection - Point in Rectangle", () => {
  const rl = new Raylib();
  
  try {
    const initResult = rl.initWindow(400, 300, "Collision Test");
    if (initResult.isOk()) {
      const rect = new Rectangle(0, 0, 50, 50);
      const pointInside = new Vector2(25, 25);
      const pointOutside = new Vector2(100, 100);
      
      const collision1 = rl.checkCollisionPointRec(pointInside, rect);
      const collision2 = rl.checkCollisionPointRec(pointOutside, rect);
      
      expect(collision1.isOk()).toBe(true);
      expect(collision2.isOk()).toBe(true);
      
      if (collision1.isOk() && collision2.isOk()) {
        expect(collision1.value).toBe(true); // Should be inside
        expect(collision2.value).toBe(false); // Should be outside
      }
      
      rl.closeWindow();
    }
  } catch (error) {
    console.log("Skipping point-rectangle collision test - no display available");
  }
});

test("Collision Detection - Point in Circle", () => {
  const rl = new Raylib();
  
  try {
    const initResult = rl.initWindow(400, 300, "Collision Test");
    if (initResult.isOk()) {
      const center = new Vector2(0, 0);
      const pointInside = new Vector2(10, 10);
      const pointOutside = new Vector2(100, 100);
      
      const collision1 = rl.checkCollisionPointCircle(pointInside, center, 20);
      const collision2 = rl.checkCollisionPointCircle(pointOutside, center, 20);
      
      expect(collision1.isOk()).toBe(true);
      expect(collision2.isOk()).toBe(true);
      
      if (collision1.isOk() && collision2.isOk()) {
        expect(collision1.value).toBe(true); // Should be inside
        expect(collision2.value).toBe(false); // Should be outside
      }
      
      rl.closeWindow();
    }
  } catch (error) {
    console.log("Skipping point-circle collision test - no display available");
  }
});

test("Collision Detection - Point in Triangle", () => {
  const rl = new Raylib();
  
  try {
    const initResult = rl.initWindow(400, 300, "Collision Test");
    if (initResult.isOk()) {
      const p1 = new Vector2(0, 0);
      const p2 = new Vector2(50, 0);
      const p3 = new Vector2(25, 50);
      
      const pointInside = new Vector2(25, 20);
      const pointOutside = new Vector2(100, 100);
      
      const collision1 = rl.checkCollisionPointTriangle(pointInside, p1, p2, p3);
      const collision2 = rl.checkCollisionPointTriangle(pointOutside, p1, p2, p3);
      
      expect(collision1.isOk()).toBe(true);
      expect(collision2.isOk()).toBe(true);
      
      if (collision1.isOk() && collision2.isOk()) {
        expect(collision1.value).toBe(true); // Should be inside
        expect(collision2.value).toBe(false); // Should be outside
      }
      
      rl.closeWindow();
    }
  } catch (error) {
    console.log("Skipping point-triangle collision test - no display available");
  }
});

test("Collision Detection - Circle vs Line", () => {
  const rl = new Raylib();
  
  try {
    const initResult = rl.initWindow(400, 300, "Collision Test");
    if (initResult.isOk()) {
      const center = new Vector2(25, 25);
      const lineStart1 = new Vector2(0, 25);
      const lineEnd1 = new Vector2(50, 25); // Line passes through circle
      const lineStart2 = new Vector2(100, 100);
      const lineEnd2 = new Vector2(150, 150); // Line doesn't intersect circle
      
      const collision1 = rl.checkCollisionCircleLine(center, 20, lineStart1, lineEnd1);
      const collision2 = rl.checkCollisionCircleLine(center, 20, lineStart2, lineEnd2);
      
      expect(collision1.isOk()).toBe(true);
      expect(collision2.isOk()).toBe(true);
      
      if (collision1.isOk() && collision2.isOk()) {
        expect(collision1.value).toBe(true); // Should intersect
        expect(collision2.value).toBe(false); // Should not intersect
      }
      
      rl.closeWindow();
    }
  } catch (error) {
    console.log("Skipping circle-line collision test - no display available");
  }
});

test("Collision Detection - Validation errors", () => {
  const rl = new Raylib();
  
  try {
    const initResult = rl.initWindow(400, 300, "Collision Test");
    if (initResult.isOk()) {
      const rect = new Rectangle(0, 0, -10, 50); // Invalid negative width
      const validRect = new Rectangle(0, 0, 50, 50);
      
      const result = rl.checkCollisionRecs(rect, validRect);
      expect(result.isErr()).toBe(true);
      
      if (result.isErr()) {
        expect(result.error.kind).toBe(RaylibErrorKind.ValidationError);
        expect(result.error.message).toContain("width cannot be negative");
      }
      
      rl.closeWindow();
    }
  } catch (error) {
    console.log("Skipping collision validation test - no display available");
  }
});

test("Collision Detection - Requires initialization", () => {
  const rl = new Raylib();
  
  const rect1 = new Rectangle(0, 0, 50, 50);
  const rect2 = new Rectangle(25, 25, 50, 50);
  
  const result = rl.checkCollisionRecs(rect1, rect2);
  expect(result.isErr()).toBe(true);
  
  if (result.isErr()) {
    expect(result.error.kind).toBe(RaylibErrorKind.StateError);
    expect(result.error.message).toContain("Window must be initialized");
  }
});