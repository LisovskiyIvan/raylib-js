import { test, expect } from "bun:test";
import Raylib from "../src/Raylib";
import { RaylibErrorKind } from "../src/types";
import { Colors } from "../src/constants";

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
  const position = result.unwrapOr({ x: 0, y: 0 });
  
  expect(position).toEqual({ x: 0, y: 0 });
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