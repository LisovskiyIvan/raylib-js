import { initRaylib } from "./raylib-ffi";
import type {
  RaylibResult,
  Texture2D,
  RenderTexture2D,
  Model,
  BoundingBox,
  Shader,
  RayCollision,
  Matrix,
  Font,
  TextMeasurement,
  TextFormatOptions,
} from "./types";
import { BlendMode, TextAlignment } from "./types";
import { initError, ffiError, stateError, validationError } from "./types";
import { Ok, Err, tryFn } from "./result";
import { ptr } from "bun:ffi";
import {
  validateAll,
  validateFinite,
  validateNonEmptyString,
  validateNonNegative,
  validatePositive,
  validateRange,
  validateColor,
} from "./validation";
import Vector2 from "./math/Vector2";
import Vector3 from "./math/Vector3";
import Rectangle from "./math/Rectangle";

export default class Raylib {
  private previousMousePos: Vector2 = Vector2.Zero();
  private textEncoder = new TextEncoder();
  private isInitialized = false;
  private windowWidth = 0;
  private windowHeight = 0;
  private rl: any;

  constructor(libraryPath?: string) {
    // Use provided base path, or RAYLIB_PATH env var, or default to 'assets' (relative to cwd)
    const basePath = libraryPath || process.env.RAYLIB_PATH || 'assets';

    try {
      this.rl = initRaylib(basePath);
    } catch (error) {
      throw new Error(
        `Failed to initialize Raylib: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private requireInitialized(): RaylibResult<void> {
    if (!this.isInitialized) {
      return new Err(
        stateError("Window must be initialized before calling this method"),
      );
    }
    return new Ok(undefined);
  }

  private safeFFICall<T>(operation: string, fn: () => T): RaylibResult<T> {
    return tryFn(fn).mapErr((error) =>
      ffiError(
        `Failed to ${operation}`,
        error instanceof Error ? error : new Error(String(error)),
      ),
    );
  }

  // Window management
  public initWindow(
    width: number,
    height: number,
    title: string,
  ): RaylibResult<void> {
    // Validate all parameters at once
    const validationResult = validateAll(
      validatePositive(width, "width"),
      validatePositive(height, "height"),
      validateNonEmptyString(title, "title"),
    );

    if (validationResult.isErr()) {
      return validationResult;
    }

    // Check if already initialized
    if (this.isInitialized) {
      return new Err(
        initError("Window is already initialized", "call closeWindow() first"),
      );
    }

    // Try to initialize
    return this.safeFFICall("initialize window", () => {
      const titleBuffer = this.textEncoder.encode(title + "\0");
      this.rl.InitWindowWrapper(width, height, ptr(titleBuffer));

      this.isInitialized = true;
      this.windowWidth = width;
      this.windowHeight = height;
    });
  }

  public closeWindow(): RaylibResult<void> {
    if (!this.isInitialized) {
      return new Ok(undefined); // Not an error if already closed
    }

    return this.safeFFICall("close window", () => {
      this.rl.CloseWindowWrapper();
      this.isInitialized = false;
      this.windowWidth = 0;
      this.windowHeight = 0;
    });
  }

  public setTargetFPS(target: number): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() => validateRange(target, 1, 1000, "target FPS"))
      .andThen(() =>
        this.safeFFICall("set target FPS", () => this.rl.SetTargetFPSWrapper(target)),
      );
  }

  public windowShouldClose(): RaylibResult<boolean> {
    return this.requireInitialized().andThen(() =>
      this.safeFFICall("check window close state", () =>
        this.rl.WindowShouldCloseWrapper(),
      ),
    );
  }

  // Drawing
  public beginDrawing(): RaylibResult<void> {
    return this.requireInitialized().andThen(() =>
      this.safeFFICall("begin drawing", () => this.rl.BeginDrawingWrapper()),
    );
  }

  public endDrawing(): RaylibResult<void> {
    return this.requireInitialized().andThen(() =>
      this.safeFFICall("end drawing", () => this.rl.EndDrawingWrapper()),
    );
  }

  public clearBackground(color: number): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() => validateColor(color, "color"))
      .andThen(() =>
        this.safeFFICall("clear background", () =>
          this.rl.ClearBackgroundWrapper(color),
        ),
      );
  }

  public drawRectangle(
    posX: number,
    posY: number,
    width: number,
    height: number,
    color: number,
  ): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(posX, "posX"),
          validateFinite(posY, "posY"),
          validateNonNegative(width, "width"),
          validateNonNegative(height, "height"),
          validateColor(color, "color"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("draw rectangle", () =>
          this.rl.DrawRectangleWrapper(posX, posY, width, height, color),
        ),
      );
  }

  public drawRectangleRec(rec: Rectangle, color: number): RaylibResult<void> {
    return this.requireInitialized().andThen(() =>
      validateAll(
        validateNonNegative(rec.width, "width"),
        validateNonNegative(rec.height, "height"),
        validateColor(color, "color"),
      ).andThen(() =>
        this.safeFFICall("draw rec", () =>
          this.drawRectangle(
            rec.x,
            rec.y,
            rec.width,
            rec.height,
            color,
          ).unwrap(),
        ),
      ),
    );
  }

  public drawText(
    text: string,
    posX: number,
    posY: number,
    fontSize: number,
    color: number,
  ): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateNonEmptyString(text, "text"),
          validateFinite(posX, "posX"),
          validateFinite(posY, "posY"),
          validatePositive(fontSize, "fontSize"),
          validateColor(color, "color"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("draw text", () => {
          const textBuffer = this.textEncoder.encode(text + "\0");
          const textPtr = ptr(textBuffer);
          this.rl.DrawTextWrapper(textPtr, posX, posY, fontSize, color);
        }),
      );
  }

  public drawFPS(posX: number, posY: number): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(validateFinite(posX, "posX"), validateFinite(posY, "posY")),
      )
      .andThen(() =>
        this.safeFFICall("draw FPS", () => this.rl.DrawFPSWrapper(posX, posY)),
      );
  }

  // Input
  public isKeyDown(key: number): RaylibResult<boolean> {
    return this.requireInitialized()
      .andThen(() => validateFinite(key, "key"))
      .andThen(() =>
        this.safeFFICall("check key down", () => this.rl.IsKeyDownWrapper(key)),
      );
  }

  public isKeyUp(key: number): RaylibResult<boolean> {
    return this.requireInitialized()
      .andThen(() => validateFinite(key, "key"))
      .andThen(() =>
        this.safeFFICall("check key up", () => this.rl.IsKeyUpWrapper(key)),
      );
  }

  public getKeyPressed(): RaylibResult<number> {
    return this.requireInitialized().andThen(() =>
      this.safeFFICall("get key pressed", () => this.rl.GetKeyPressedWrapper()),
    );
  }

  public isMouseButtonDown(button: number): RaylibResult<boolean> {
    return this.requireInitialized()
      .andThen(() => validateFinite(button, "button"))
      .andThen(() =>
        this.safeFFICall("check mouse button down", () =>
          this.rl.IsMouseButtonDownWrapper(button),
        ),
      );
  }

  public getMousePosition(): RaylibResult<Vector2> {
    return this.requireInitialized().andThen(() =>
      this.safeFFICall(
        "get mouse position",
        () => new Vector2(this.rl.GetMouseXWrapper(), this.rl.GetMouseYWrapper()),
      ),
    );
  }

  public getMouseDelta(): RaylibResult<Vector2> {
    const pos = this.getMousePosition().unwrap();
    const delta = pos.subtract(this.previousMousePos);
    this.previousMousePos.copyFrom(pos);
    return new Ok(delta);
  }

  public setMousePosition(x: number, y: number): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(validateFinite(x, "x"), validateFinite(y, "y")),
      )
      .andThen(() =>
        this.safeFFICall("set mouse position", () =>
          this.rl.SetMousePositionWrapper(x, y),
        ),
      );
  }

  public disableCursor(): RaylibResult<void> {
    return this.requireInitialized().andThen(() =>
      this.safeFFICall("disable cursor", () => this.rl.DisableCursorWrapper()),
    );
  }

  public enableCursor(): RaylibResult<void> {
    return this.requireInitialized().andThen(() =>
      this.safeFFICall("enable cursor", () => this.rl.EnableCursorWrapper()),
    );
  }

  public hideCursor(): RaylibResult<void> {
    return this.requireInitialized().andThen(() =>
      this.safeFFICall("hide cursor", () => this.rl.HideCursorWrapper()),
    );
  }

  public showCursor(): RaylibResult<void> {
    return this.requireInitialized().andThen(() =>
      this.safeFFICall("show cursor", () => this.rl.ShowCursorWrapper()),
    );
  }

  public isCursorHidden(): RaylibResult<boolean> {
    return this.requireInitialized().andThen(() =>
      this.safeFFICall("check cursor hidden", () => this.rl.IsCursorHiddenWrapper()),
    );
  }

  public getFrameTime(): RaylibResult<number> {
    return this.requireInitialized().andThen(() =>
      this.safeFFICall("get frame time", () => this.rl.GetFrameTimeWrapper()),
    );
  }

  public drawPixel(posX: number, posY: number, color: number) {
    return this.requireInitialized()
      .andThen(() => validateColor(color, "color"))
      .andThen(() =>
        this.safeFFICall("draw a pixel", () =>
          this.rl.DrawPixelWrapper(posX, posY, color),
        ),
      );
  }

  public drawPixelV(position: Vector2, color: number) {
    return this.requireInitialized()
      .andThen(() => validateColor(color, "color"))
      .andThen(() =>
        this.safeFFICall("draw a pixel", () =>
          this.rl.DrawPixelWrapper(position.x, position.y, color),
        ),
      );
  }

  public drawLine(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    color: number,
  ) {
    return this.requireInitialized()
      .andThen(() => validateColor(color, "color"))
      .andThen(() =>
        this.safeFFICall("draw a line", () =>
          this.rl.DrawLineWrapper(startX, startY, endX, endY, color),
        ),
      );
  }

  public drawLineV(start: Vector2, end: Vector2, color: number) {
    return this.requireInitialized()
      .andThen(() => validateColor(color, "color"))
      .andThen(() =>
        this.safeFFICall("draw a line", () =>
          this.rl.DrawLineWrapper(start.x, start.y, end.x, end.y, color),
        ),
      );
  }

  public drawCircle(
    centerX: number,
    centerY: number,
    radius: number,
    color: number,
  ) {
    return this.requireInitialized()
      .andThen(() => validateColor(color, "color"))
      .andThen(() =>
        this.safeFFICall("draw a line", () =>
          this.rl.DrawCircleWrapper(centerX, centerY, radius, color),
        ),
      );
  }

  public drawCircleV(center: Vector2, radius: number, color: number) {
    return this.requireInitialized()
      .andThen(() => validateColor(color, "color"))
      .andThen(() =>
        this.safeFFICall("draw a line", () =>
          this.rl.DrawCircleWrapper(center.x, center.y, radius, color),
        ),
      );
  }

  public drawTriangle(
    v1: Vector2,
    v2: Vector2,
    v3: Vector2,
    color: number,
  ): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(v1.x, "v1.x"),
          validateFinite(v1.y, "v1.y"),
          validateFinite(v2.x, "v2.x"),
          validateFinite(v2.y, "v2.y"),
          validateFinite(v3.x, "v3.x"),
          validateFinite(v3.y, "v3.y"),
          validateColor(color, "color"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("draw triangle", () => {
          return this.rl.DrawTriangleWrapper(
            v1.x,
            v1.y,
            v2.x,
            v2.y,
            v3.x,
            v3.y,
            color,
          );
        }),
      );
  }

  public drawTriangleLines(
    v1: Vector2,
    v2: Vector2,
    v3: Vector2,
    color: number,
  ): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(v1.x, "v1.x"),
          validateFinite(v1.y, "v1.y"),
          validateFinite(v2.x, "v2.x"),
          validateFinite(v2.y, "v2.y"),
          validateFinite(v3.x, "v3.x"),
          validateFinite(v3.y, "v3.y"),
          validateColor(color, "color"),
        ),
      )
      .andThen(() => {
        // Always use reliable line drawing for triangle outlines
        return this.safeFFICall("draw triangle lines", () => {
          this.rl.DrawLineWrapper(v1.x, v1.y, v2.x, v2.y, color);
          this.rl.DrawLineWrapper(v2.x, v2.y, v3.x, v3.y, color);
          this.rl.DrawLineWrapper(v3.x, v3.y, v1.x, v1.y, color);
        });
      });
  }

  public drawRectanglePro(
    rec: Rectangle,
    origin: Vector2,
    rotation: number,
    color: number,
  ): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(rec.x, "rec.x"),
          validateFinite(rec.y, "rec.y"),
          validateNonNegative(rec.width, "rec.width"),
          validateNonNegative(rec.height, "rec.height"),
          validateFinite(origin.x, "origin.x"),
          validateFinite(origin.y, "origin.y"),
          validateFinite(rotation, "rotation"),
          validateColor(color, "color"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("draw rectangle pro", () => {
          this.rl.DrawRectangleProWrapper(
            rec.x, rec.y, rec.width, rec.height,
            origin.x, origin.y,
            rotation,
            color
          );
        }),
      );
  }

  // Collision detection
  public checkCollisionRecs(
    rec1: Rectangle,
    rec2: Rectangle,
  ): RaylibResult<boolean> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(rec1.x, "rec1.x"),
          validateFinite(rec1.y, "rec1.y"),
          validateNonNegative(rec1.width, "rec1.width"),
          validateNonNegative(rec1.height, "rec1.height"),
          validateFinite(rec2.x, "rec2.x"),
          validateFinite(rec2.y, "rec2.y"),
          validateNonNegative(rec2.width, "rec2.width"),
          validateNonNegative(rec2.height, "rec2.height"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("check collision rectangles", () => {
          return this.rl.CheckCollisionRecsWrapper(
            rec1.x, rec1.y, rec1.width, rec1.height,
            rec2.x, rec2.y, rec2.width, rec2.height
          );
        }),
      );
  }

  public checkCollisionCircles(
    center1: Vector2,
    radius1: number,
    center2: Vector2,
    radius2: number,
  ): RaylibResult<boolean> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(center1.x, "center1.x"),
          validateFinite(center1.y, "center1.y"),
          validateNonNegative(radius1, "radius1"),
          validateFinite(center2.x, "center2.x"),
          validateFinite(center2.y, "center2.y"),
          validateNonNegative(radius2, "radius2"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("check collision circles", () => {
          return this.rl.CheckCollisionCirclesWrapper(
            center1.x, center1.y, radius1,
            center2.x, center2.y, radius2
          );
        }),
      );
  }

  private checkCollisionCirclesFallback(
    center1: Vector2,
    radius1: number,
    center2: Vector2,
    radius2: number,
  ): boolean {
    const dx = center2.x - center1.x;
    const dy = center2.y - center1.y;
    const distanceSquared = dx * dx + dy * dy;
    const radiusSum = radius1 + radius2;
    return distanceSquared <= radiusSum * radiusSum;
  }

  public checkCollisionCircleRec(
    center: Vector2,
    radius: number,
    rec: Rectangle,
  ): RaylibResult<boolean> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(center.x, "center.x"),
          validateFinite(center.y, "center.y"),
          validateNonNegative(radius, "radius"),
          validateFinite(rec.x, "rec.x"),
          validateFinite(rec.y, "rec.y"),
          validateNonNegative(rec.width, "rec.width"),
          validateNonNegative(rec.height, "rec.height"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("check collision circle rectangle", () => {
          return this.rl.CheckCollisionCircleRecWrapper(
            center.x, center.y, radius,
            rec.x, rec.y, rec.width, rec.height
          );
        }),
      );
  }

  private checkCollisionCircleRecFallback(
    center: Vector2,
    radius: number,
    rec: Rectangle,
  ): boolean {
    // Find the closest point on the rectangle to the circle center
    const closestX = Math.max(rec.x, Math.min(center.x, rec.x + rec.width));
    const closestY = Math.max(rec.y, Math.min(center.y, rec.y + rec.height));

    // Calculate the distance between the circle center and the closest point
    const distanceX = center.x - closestX;
    const distanceY = center.y - closestY;
    const distanceSquared = distanceX * distanceX + distanceY * distanceY;

    // Check if the distance is less than or equal to the radius
    return distanceSquared <= radius * radius;
  }

  public checkCollisionCircleLine(
    center: Vector2,
    radius: number,
    p1: Vector2,
    p2: Vector2,
  ): RaylibResult<boolean> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(center.x, "center.x"),
          validateFinite(center.y, "center.y"),
          validateNonNegative(radius, "radius"),
          validateFinite(p1.x, "p1.x"),
          validateFinite(p1.y, "p1.y"),
          validateFinite(p2.x, "p2.x"),
          validateFinite(p2.y, "p2.y"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("check collision circle line", () => {
          return this.rl.CheckCollisionCircleLineWrapper(
            center.x, center.y, radius,
            p1.x, p1.y, p2.x, p2.y
          );
        }),
      );
  }

  public checkCollisionPointRec(
    point: Vector2,
    rec: Rectangle,
  ): RaylibResult<boolean> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(point.x, "point.x"),
          validateFinite(point.y, "point.y"),
          validateFinite(rec.x, "rec.x"),
          validateFinite(rec.y, "rec.y"),
          validateNonNegative(rec.width, "rec.width"),
          validateNonNegative(rec.height, "rec.height"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("check collision point rectangle", () => {
          return this.rl.CheckCollisionPointRecWrapper(
            point.x, point.y,
            rec.x, rec.y, rec.width, rec.height
          );
        }),
      );
  }

  private checkCollisionPointRecFallback(
    point: Vector2,
    rec: Rectangle,
  ): boolean {
    return (
      point.x >= rec.x &&
      point.x <= rec.x + rec.width &&
      point.y >= rec.y &&
      point.y <= rec.y + rec.height
    );
  }

  public checkCollisionPointCircle(
    point: Vector2,
    center: Vector2,
    radius: number,
  ): RaylibResult<boolean> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(point.x, "point.x"),
          validateFinite(point.y, "point.y"),
          validateFinite(center.x, "center.x"),
          validateFinite(center.y, "center.y"),
          validateNonNegative(radius, "radius"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("check collision point circle", () => {
          return this.rl.CheckCollisionPointCircleWrapper(
            point.x, point.y,
            center.x, center.y, radius
          );
        }),
      );
  }

  private checkCollisionPointCircleFallback(
    point: Vector2,
    center: Vector2,
    radius: number,
  ): boolean {
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    const distanceSquared = dx * dx + dy * dy;
    return distanceSquared <= radius * radius;
  }

  public checkCollisionPointTriangle(
    point: Vector2,
    p1: Vector2,
    p2: Vector2,
    p3: Vector2,
  ): RaylibResult<boolean> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(point.x, "point.x"),
          validateFinite(point.y, "point.y"),
          validateFinite(p1.x, "p1.x"),
          validateFinite(p1.y, "p1.y"),
          validateFinite(p2.x, "p2.x"),
          validateFinite(p2.y, "p2.y"),
          validateFinite(p3.x, "p3.x"),
          validateFinite(p3.y, "p3.y"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("check collision point triangle", () => {
          return this.rl.CheckCollisionPointTriangleWrapper(
            point.x, point.y,
            p1.x, p1.y, p2.x, p2.y, p3.x, p3.y
          );
        }),
      );
  }

  // Multiple texture management
  public loadTexture(fileName: string): RaylibResult<number> {
    return this.requireInitialized()
      .andThen(() => validateNonEmptyString(fileName, "fileName"))
      .andThen(() =>
        this.safeFFICall("load texture to slot", () => {
          const fileNameBuffer = this.textEncoder.encode(fileName + "\0");
          const fileNamePtr = ptr(fileNameBuffer);

          const slotIndex = this.rl.LoadTextureToSlot(fileNamePtr);

          if (slotIndex < 0) {
            throw new Error(
              "Failed to load texture or no free slots available",
            );
          }

          return slotIndex;
        }),
      );
  }

  public getTextureFromSlot(slotIndex: number): RaylibResult<Texture2D> {
    return this.requireInitialized()
      .andThen(() => validateFinite(slotIndex, "slotIndex"))
      .andThen(() =>
        this.safeFFICall("get texture from slot", () => {
          const id = this.rl.GetTextureIdBySlot(slotIndex);
          if (id === 0) {
            throw new Error("Invalid slot index or texture not loaded");
          }

          const texture: Texture2D = {
            id,
            width: this.rl.GetTextureWidthBySlot(slotIndex),
            height: this.rl.GetTextureHeightBySlot(slotIndex),
            mipmaps: this.rl.GetTextureMipmapsBySlot(slotIndex),
            format: this.rl.GetTextureFormatBySlot(slotIndex),
          };
          return texture;
        }),
      );
  }

  public unloadTextureFromSlot(slotIndex: number): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() => validateFinite(slotIndex, "slotIndex"))
      .andThen(() =>
        this.safeFFICall("unload texture from slot", () => {
          this.rl.UnloadTextureBySlot(slotIndex);
        }),
      );
  }

  public drawTextureFromSlot(
    slotIndex: number,
    posX: number,
    posY: number,
    tint: number,
  ): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(slotIndex, "slotIndex"),
          validateFinite(posX, "posX"),
          validateFinite(posY, "posY"),
          validateColor(tint, "tint"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("draw texture from slot", () => {
          this.rl.DrawTextureBySlot(slotIndex, posX, posY, tint);
        }),
      );
  }

  public drawTextureProFromSlot(
    slotIndex: number,
    posX: number,
    posY: number,
    originX: number,
    originY: number,
    rotation: number,
    scale: number,
    tint: number,
  ): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(slotIndex, "slotIndex"),
          validateFinite(posX, "posX"),
          validateFinite(posY, "posY"),
          validateFinite(originX, "originX"),
          validateFinite(originY, "originY"),
          validateFinite(rotation, "rotation"),
          validateFinite(scale, "scale"),
          validateColor(tint, "tint"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("draw texture pro from slot", () => {
          this.rl.DrawTextureProBySlot(
            slotIndex,
            posX,
            posY,
            originX,
            originY,
            rotation,
            scale,
            tint,
          );
        }),
      );
  }

  public getLoadedTextureCount(): RaylibResult<number> {
    return this.requireInitialized().andThen(() =>
      this.safeFFICall("get loaded texture count", () => {
        return this.rl.GetLoadedTextureCount();
      }),
    );
  }

  public unloadAllTextures(): RaylibResult<void> {
    return this.requireInitialized().andThen(() =>
      this.safeFFICall("unload all textures", () => {
        this.rl.UnloadAllTextures();
      }),
    );
  }

  // Render texture management
  public loadRenderTexture(
    width: number,
    height: number,
  ): RaylibResult<number> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validatePositive(width, "width"),
          validatePositive(height, "height"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("load render texture to slot", () => {
          const slotIndex = this.rl.LoadRenderTextureToSlot(width, height);

          if (slotIndex < 0) {
            throw new Error(
              "Failed to create render texture or no free slots available",
            );
          }

          return slotIndex;
        }),
      );
  }

  public getRenderTextureFromSlot(
    slotIndex: number,
  ): RaylibResult<RenderTexture2D> {
    return this.requireInitialized()
      .andThen(() => validateFinite(slotIndex, "slotIndex"))
      .andThen(() =>
        this.safeFFICall("get render texture from slot", () => {
          const id = this.rl.GetRenderTextureIdBySlot(slotIndex);
          if (id === 0) {
            throw new Error("Invalid slot index or render texture not loaded");
          }

          const texture: Texture2D = {
            id: this.rl.GetRenderTextureColorIdBySlot(slotIndex),
            width: this.rl.GetRenderTextureColorWidthBySlot(slotIndex),
            height: this.rl.GetRenderTextureColorHeightBySlot(slotIndex),
            mipmaps: this.rl.GetRenderTextureColorMipmapsBySlot(slotIndex),
            format: this.rl.GetRenderTextureColorFormatBySlot(slotIndex),
          };

          const depth: Texture2D = {
            id: this.rl.GetRenderTextureDepthIdBySlot(slotIndex),
            width: this.rl.GetRenderTextureDepthWidthBySlot(slotIndex),
            height: this.rl.GetRenderTextureDepthHeightBySlot(slotIndex),
            mipmaps: this.rl.GetRenderTextureDepthMipmapsBySlot(slotIndex),
            format: this.rl.GetRenderTextureDepthFormatBySlot(slotIndex),
          };

          const renderTexture: RenderTexture2D = {
            id,
            texture,
            depth,
          };
          return renderTexture;
        }),
      );
  }

  public unloadRenderTextureFromSlot(slotIndex: number): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() => validateFinite(slotIndex, "slotIndex"))
      .andThen(() =>
        this.safeFFICall("unload render texture from slot", () => {
          this.rl.UnloadRenderTextureBySlot(slotIndex);
        }),
      );
  }

  public getLoadedRenderTextureCount(): RaylibResult<number> {
    return this.requireInitialized().andThen(() =>
      this.safeFFICall("get loaded render texture count", () => {
        return this.rl.GetLoadedRenderTextureCount();
      }),
    );
  }

  public unloadAllRenderTextures(): RaylibResult<void> {
    return this.requireInitialized().andThen(() =>
      this.safeFFICall("unload all render textures", () => {
        this.rl.UnloadAllRenderTextures();
      }),
    );
  }

  // 3D Camera and mode functions
  public beginMode3D(
    cameraPosition: Vector3,
    cameraTarget: Vector3,
    cameraUp: Vector3,
    fovy: number,
    projection: number,
  ): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(cameraPosition.x, "cameraPosition.x"),
          validateFinite(cameraPosition.y, "cameraPosition.y"),
          validateFinite(cameraPosition.z, "cameraPosition.z"),
          validateFinite(cameraTarget.x, "cameraTarget.x"),
          validateFinite(cameraTarget.y, "cameraTarget.y"),
          validateFinite(cameraTarget.z, "cameraTarget.z"),
          validateFinite(cameraUp.x, "cameraUp.x"),
          validateFinite(cameraUp.y, "cameraUp.y"),
          validateFinite(cameraUp.z, "cameraUp.z"),
          validateFinite(fovy, "fovy"),
          validateFinite(projection, "projection"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("begin mode 3D", () => {
          this.rl.BeginMode3DWrapper(
            cameraPosition.x, cameraPosition.y, cameraPosition.z,
            cameraTarget.x, cameraTarget.y, cameraTarget.z,
            cameraUp.x, cameraUp.y, cameraUp.z,
            fovy, projection
          );
        }),
      );
  }

  public endMode3D(): RaylibResult<void> {
    return this.requireInitialized().andThen(() =>
      this.safeFFICall("end mode 3D", () => this.rl.EndMode3DWrapper()),
    );
  }

  // 3D Drawing functions
  public drawLine3D(
    startPos: Vector3,
    endPos: Vector3,
    color: number,
  ): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(startPos.x, "startPos.x"),
          validateFinite(startPos.y, "startPos.y"),
          validateFinite(startPos.z, "startPos.z"),
          validateFinite(endPos.x, "endPos.x"),
          validateFinite(endPos.y, "endPos.y"),
          validateFinite(endPos.z, "endPos.z"),
          validateColor(color, "color"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("draw line 3D", () => {
          this.rl.DrawLine3DWrapper(
            startPos.x, startPos.y, startPos.z,
            endPos.x, endPos.y, endPos.z,
            color
          );
        }),
      );
  }

  public drawPoint3D(position: Vector3, color: number): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(position.x, "position.x"),
          validateFinite(position.y, "position.y"),
          validateFinite(position.z, "position.z"),
          validateColor(color, "color"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("draw point 3D", () => {
          this.rl.DrawPoint3DWrapper(position.x, position.y, position.z, color);
        }),
      );
  }

  public drawCircle3D(
    center: Vector3,
    radius: number,
    rotationAxis: Vector3,
    rotationAngle: number,
    color: number,
  ): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(center.x, "center.x"),
          validateFinite(center.y, "center.y"),
          validateFinite(center.z, "center.z"),
          validateNonNegative(radius, "radius"),
          validateFinite(rotationAxis.x, "rotationAxis.x"),
          validateFinite(rotationAxis.y, "rotationAxis.y"),
          validateFinite(rotationAxis.z, "rotationAxis.z"),
          validateFinite(rotationAngle, "rotationAngle"),
          validateColor(color, "color"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("draw circle 3D", () => {
          this.rl.DrawCircle3DWrapper(
            center.x, center.y, center.z, radius,
            rotationAxis.x, rotationAxis.y, rotationAxis.z, rotationAngle,
            color
          );
        }),
      );
  }

  public drawTriangle3D(
    v1: Vector3,
    v2: Vector3,
    v3: Vector3,
    color: number,
  ): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(v1.x, "v1.x"),
          validateFinite(v1.y, "v1.y"),
          validateFinite(v1.z, "v1.z"),
          validateFinite(v2.x, "v2.x"),
          validateFinite(v2.y, "v2.y"),
          validateFinite(v2.z, "v2.z"),
          validateFinite(v3.x, "v3.x"),
          validateFinite(v3.y, "v3.y"),
          validateFinite(v3.z, "v3.z"),
          validateColor(color, "color"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("draw triangle 3D", () => {
          this.rl.DrawTriangle3DWrapper(
            v1.x, v1.y, v1.z,
            v2.x, v2.y, v2.z,
            v3.x, v3.y, v3.z,
            color
          );
        }),
      );
  }

  // Additional 3D shapes
  public drawCube(
    position: Vector3,
    width: number,
    height: number,
    length: number,
    color: number,
  ): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(position.x, "position.x"),
          validateFinite(position.y, "position.y"),
          validateFinite(position.z, "position.z"),
          validateNonNegative(width, "width"),
          validateNonNegative(height, "height"),
          validateNonNegative(length, "length"),
          validateColor(color, "color"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("draw cube", () => {
          this.rl.DrawCubeWrapper(
            position.x, position.y, position.z,
            width, height, length, color
          );
        }),
      );
  }

  public drawCubeV(
    position: Vector3,
    size: Vector3,
    color: number,
  ): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(position.x, "position.x"),
          validateFinite(position.y, "position.y"),
          validateFinite(position.z, "position.z"),
          validateNonNegative(size.x, "size.x"),
          validateNonNegative(size.y, "size.y"),
          validateNonNegative(size.z, "size.z"),
          validateColor(color, "color"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("draw cube V", () => {
          this.rl.DrawCubeVWrapper(
            position.x, position.y, position.z,
            size.x, size.y, size.z,
            color
          );
        }),
      );
  }

  public drawSphere(
    centerPos: Vector3,
    radius: number,
    color: number,
  ): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(centerPos.x, "centerPos.x"),
          validateFinite(centerPos.y, "centerPos.y"),
          validateFinite(centerPos.z, "centerPos.z"),
          validateNonNegative(radius, "radius"),
          validateColor(color, "color"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("draw sphere", () => {
          this.rl.DrawSphereWrapper(
            centerPos.x, centerPos.y, centerPos.z,
            radius, color
          );
        }),
      );
  }

  public drawCylinder(
    position: Vector3,
    radiusTop: number,
    radiusBottom: number,
    height: number,
    slices: number,
    color: number,
  ): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(position.x, "position.x"),
          validateFinite(position.y, "position.y"),
          validateFinite(position.z, "position.z"),
          validateNonNegative(radiusTop, "radiusTop"),
          validateNonNegative(radiusBottom, "radiusBottom"),
          validateNonNegative(height, "height"),
          validatePositive(slices, "slices"),
          validateColor(color, "color"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("draw cylinder", () => {
          this.rl.DrawCylinderWrapper(
            position.x,
            position.y,
            position.z,
            radiusTop,
            radiusBottom,
            height,
            slices,
            color,
          );
        }),
      );
  }

  public drawCapsule(
    startPos: Vector3,
    endPos: Vector3,
    radius: number,
    slices: number,
    rings: number,
    color: number,
  ): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(startPos.x, "startPos.x"),
          validateFinite(startPos.y, "startPos.y"),
          validateFinite(startPos.z, "startPos.z"),
          validateFinite(endPos.x, "endPos.x"),
          validateFinite(endPos.y, "endPos.y"),
          validateFinite(endPos.z, "endPos.z"),
          validateNonNegative(radius, "radius"),
          validatePositive(slices, "slices"),
          validatePositive(rings, "rings"),
          validateColor(color, "color"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("draw capsule", () => {
          this.rl.DrawCapsuleWrapper(
            startPos.x,
            startPos.y,
            startPos.z,
            endPos.x,
            endPos.y,
            endPos.z,
            radius,
            slices,
            rings,
            color,
          );
        }),
      );
  }

  public drawPlane(
    centerPos: Vector3,
    size: Vector2,
    color: number,
  ): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(centerPos.x, "centerPos.x"),
          validateFinite(centerPos.y, "centerPos.y"),
          validateFinite(centerPos.z, "centerPos.z"),
          validateNonNegative(size.x, "size.x"),
          validateNonNegative(size.y, "size.y"),
          validateColor(color, "color"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("draw plane", () => {
          this.rl.DrawPlaneWrapper(centerPos.x, centerPos.y, centerPos.z, size.x, size.y, color);
        }),
      );
  }

  public drawRay(
    rayPosition: Vector3,
    rayDirection: Vector3,
    color: number,
  ): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(rayPosition.x, "rayPosition.x"),
          validateFinite(rayPosition.y, "rayPosition.y"),
          validateFinite(rayPosition.z, "rayPosition.z"),
          validateFinite(rayDirection.x, "rayDirection.x"),
          validateFinite(rayDirection.y, "rayDirection.y"),
          validateFinite(rayDirection.z, "rayDirection.z"),
          validateColor(color, "color"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("draw ray", () => {
          this.rl.DrawRayWrapper(rayPosition.x, rayPosition.y, rayPosition.z, rayDirection.x, rayDirection.y, rayDirection.z, color);
        }),
      );
  }

  public drawGrid(slices: number, spacing: number): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validatePositive(slices, "slices"),
          validatePositive(spacing, "spacing"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("draw grid", () => this.rl.DrawGridWrapper(slices, spacing)),
      );
  }

  // Model loading/unloading functions
  public loadModel(fileName: string): RaylibResult<Model> {
    return this.requireInitialized()
      .andThen(() => validateNonEmptyString(fileName, "fileName"))
      .andThen(() =>
        this.safeFFICall("load model to slot", () => {
          const fileNameBuffer = this.textEncoder.encode(fileName + "\0");
          const fileNamePtr = ptr(fileNameBuffer);

          const dataBuffer = new Int32Array(3);
          const slotIndex = this.rl.LoadModelToSlot(
            fileNamePtr,
            ptr(dataBuffer),
          );
          if (slotIndex < 0) {
            throw new Error("Failed to load model or no free slots available");
          }

          const model: Model = {
            slotIndex: dataBuffer[0]!,
            meshCount: dataBuffer[1]!,
            materialCount: dataBuffer[2]!,
          };
          return model;
        }),
      );
  }

  public unloadModel(model: Model): RaylibResult<void> {
    return this.requireInitialized().andThen(() => {
      if (model.slotIndex < 0) {
        return new Err(validationError("Invalid model slot index"));
      }
      return this.safeFFICall("unload model from slot", () => {
        this.rl.UnloadModelBySlot(model.slotIndex);
      });
    });
  }

  public getModelBoundingBox(model: Model): RaylibResult<BoundingBox> {
    return this.requireInitialized().andThen(() => {
      if (model.slotIndex < 0) {
        return new Err(validationError("Invalid model slot index"));
      }
      return this.safeFFICall("get model bounding box", () => {
        const bboxBuffer = new Float32Array(6);
        this.rl.GetModelBoundingBoxBySlot(model.slotIndex, ptr(bboxBuffer));

        const boundingBox: BoundingBox = {
          min: {
            x: bboxBuffer[0]!,
            y: bboxBuffer[1]!,
            z: bboxBuffer[2]!,
          },
          max: {
            x: bboxBuffer[3]!,
            y: bboxBuffer[4]!,
            z: bboxBuffer[5]!,
          },
        };

        return boundingBox;
      });
    });
  }

  public getModelInformation(model: Model): RaylibResult<{
    meshCount: number;
    materialCount: number;
    boundingBox: BoundingBox;
  }> {
    return this.requireInitialized().andThen(() => {
      if (model.slotIndex < 0) {
        return new Err(validationError("Invalid model slot index"));
      }
      return this.safeFFICall("get model information", () => {
        // Get model data (meshCount, materialCount)
        const dataBuffer = new Int32Array(3);
        this.rl.GetModelDataBySlot(model.slotIndex, ptr(dataBuffer));

        // Get bounding box
        const bboxBuffer = new Float32Array(6);
        this.rl.GetModelBoundingBoxBySlot(model.slotIndex, ptr(bboxBuffer));

        const boundingBox: BoundingBox = {
          min: {
            x: bboxBuffer[0]!,
            y: bboxBuffer[1]!,
            z: bboxBuffer[2]!,
          },
          max: {
            x: bboxBuffer[3]!,
            y: bboxBuffer[4]!,
            z: bboxBuffer[5]!,
          },
        };

        return {
          meshCount: dataBuffer[1]!,
          materialCount: dataBuffer[2]!,
          boundingBox,
        };
      });
    });
  }

  // Additional model functions
  public drawModel(
    model: Model,
    position: Vector3,
    scale: number,
    tint: number,
  ): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(model.slotIndex, "model.slotIndex"),
          validateFinite(position.x, "position.x"),
          validateFinite(position.y, "position.y"),
          validateFinite(position.z, "position.z"),
          validateFinite(scale, "scale"),
          validateColor(tint, "tint"),
        ),
      )
      .andThen(() => {
        // Check if model is valid before attempting to draw
        const isValidResult = this.isModelSlotValid(model.slotIndex);
        if (isValidResult.isErr()) {
          console.warn(
            "Cannot validate model slot, using fallback cube representation",
          );
          return this.drawCube(position, scale * 2, scale * 2, scale * 2, tint);
        }
        if (!isValidResult.unwrap()) {
          console.warn(
            "Invalid model slot, using fallback cube representation",
          );
          return this.drawCube(position, scale * 2, scale * 2, scale * 2, tint);
        }

        // Use real FFI call to draw the model
        return this.safeFFICall("draw model", () => {
          this.rl.DrawModelBySlot(
            model.slotIndex,
            position.x,
            position.y,
            position.z,
            scale,
            tint,
          );
        });
      });
  }

  public drawModelEx(
    model: Model,
    position: Vector3,
    rotationAxis: Vector3,
    rotationAngle: number,
    scale: Vector3,
    tint: number,
  ): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(model.slotIndex, "model.slotIndex"),
          validateFinite(position.x, "position.x"),
          validateFinite(position.y, "position.y"),
          validateFinite(position.z, "position.z"),
          validateFinite(rotationAxis.x, "rotationAxis.x"),
          validateFinite(rotationAxis.y, "rotationAxis.y"),
          validateFinite(rotationAxis.z, "rotationAxis.z"),
          validateFinite(rotationAngle, "rotationAngle"),
          validateFinite(scale.x, "scale.x"),
          validateFinite(scale.y, "scale.y"),
          validateFinite(scale.z, "scale.z"),
          validateColor(tint, "tint"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("draw model ex", () => {
          this.rl.DrawModelExBySlot(
            model.slotIndex,
            position.x,
            position.y,
            position.z,
            rotationAxis.x,
            rotationAxis.y,
            rotationAxis.z,
            rotationAngle,
            scale.x,
            scale.y,
            scale.z,
            tint,
          );
        }),
      );
  }

  public drawModelWires(
    model: Model,
    position: Vector3,
    scale: number,
    tint: number,
  ): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(model.slotIndex, "model.slotIndex"),
          validateFinite(position.x, "position.x"),
          validateFinite(position.y, "position.y"),
          validateFinite(position.z, "position.z"),
          validateFinite(scale, "scale"),
          validateColor(tint, "tint"),
        ),
      )
      .andThen(() => {
        // Check if model is valid before attempting to draw
        const isValidResult = this.isModelSlotValid(model.slotIndex);
        if (isValidResult.isErr()) {
          console.warn(
            "Cannot validate model slot, using fallback wireframe cube",
          );
          return this.drawWireframeCube(position, scale * 2, tint);
        }
        if (!isValidResult.unwrap()) {
          console.warn("Invalid model slot, using fallback wireframe cube");
          return this.drawWireframeCube(position, scale * 2, tint);
        }

        // Use real FFI call to draw the model wireframe
        return this.safeFFICall("draw model wires", () => {
          this.rl.DrawModelWiresBySlot(
            model.slotIndex,
            position.x,
            position.y,
            position.z,
            scale,
            tint,
          );
        });
      });
  }

  private drawWireframeCube(
    position: Vector3,
    size: number,
    tint: number,
  ): RaylibResult<void> {
    const halfSize = size / 2;

    // Draw cube edges
    const corners = [
      new Vector3(
        position.x - halfSize,
        position.y - halfSize,
        position.z - halfSize,
      ),
      new Vector3(
        position.x + halfSize,
        position.y - halfSize,
        position.z - halfSize,
      ),
      new Vector3(
        position.x + halfSize,
        position.y + halfSize,
        position.z - halfSize,
      ),
      new Vector3(
        position.x - halfSize,
        position.y + halfSize,
        position.z - halfSize,
      ),
      new Vector3(
        position.x - halfSize,
        position.y - halfSize,
        position.z + halfSize,
      ),
      new Vector3(
        position.x + halfSize,
        position.y - halfSize,
        position.z + halfSize,
      ),
      new Vector3(
        position.x + halfSize,
        position.y + halfSize,
        position.z + halfSize,
      ),
      new Vector3(
        position.x - halfSize,
        position.y + halfSize,
        position.z + halfSize,
      ),
    ];

    // Draw 12 edges of the cube
    const results = [
      this.drawLine3D(corners[0]!, corners[1]!, tint),
      this.drawLine3D(corners[1]!, corners[2]!, tint),
      this.drawLine3D(corners[2]!, corners[3]!, tint),
      this.drawLine3D(corners[3]!, corners[0]!, tint),
      this.drawLine3D(corners[4]!, corners[5]!, tint),
      this.drawLine3D(corners[5]!, corners[6]!, tint),
      this.drawLine3D(corners[6]!, corners[7]!, tint),
      this.drawLine3D(corners[7]!, corners[4]!, tint),
      this.drawLine3D(corners[0]!, corners[4]!, tint),
      this.drawLine3D(corners[1]!, corners[5]!, tint),
      this.drawLine3D(corners[2]!, corners[6]!, tint),
      this.drawLine3D(corners[3]!, corners[7]!, tint),
    ];

    // Check if any line drawing failed
    for (const result of results) {
      if (result.isErr()) {
        return result;
      }
    }

    return new Ok(undefined);
  }

  public isModelSlotValid(slotIndex: number): RaylibResult<boolean> {
    return this.requireInitialized().andThen(() =>
      this.safeFFICall("is model slot valid", () => {
        return this.rl.IsModelSlotValid(slotIndex);
      }),
    );
  }

  public getLoadedModelCount(): RaylibResult<number> {
    return this.requireInitialized().andThen(() =>
      this.safeFFICall("get loaded model count", () => {
        return this.rl.GetLoadedModelCount();
      }),
    );
  }

  public unloadAllModels(): RaylibResult<void> {
    return this.requireInitialized().andThen(() =>
      this.safeFFICall("unload all models", () => {
        this.rl.UnloadAllModels();
      }),
    );
  }

  // State getters
  public get initialized(): boolean {
    return this.isInitialized;
  }

  public get width(): number {
    return this.windowWidth;
  }

  public get height(): number {
    return this.windowHeight;
  }

  // 3D Collision detection functions
  public checkCollisionSpheres(
    center1: Vector3,
    radius1: number,
    center2: Vector3,
    radius2: number,
  ): RaylibResult<boolean> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(center1.x, "center1.x"),
          validateFinite(center1.y, "center1.y"),
          validateFinite(center1.z, "center1.z"),
          validateNonNegative(radius1, "radius1"),
          validateFinite(center2.x, "center2.x"),
          validateFinite(center2.y, "center2.y"),
          validateFinite(center2.z, "center2.z"),
          validateNonNegative(radius2, "radius2"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("check collision spheres", () => {
          return this.rl.CheckCollisionSpheresWrapper(
            center1.x,
            center1.y,
            center1.z,
            radius1,
            center2.x,
            center2.y,
            center2.z,
            radius2,
          );
        }),
      );
  }

  public checkCollisionBoxes(
    box1: BoundingBox,
    box2: BoundingBox,
  ): RaylibResult<boolean> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(box1.min.x, "box1.min.x"),
          validateFinite(box1.min.y, "box1.min.y"),
          validateFinite(box1.min.z, "box1.min.z"),
          validateFinite(box1.max.x, "box1.max.x"),
          validateFinite(box1.max.y, "box1.max.y"),
          validateFinite(box1.max.z, "box1.max.z"),
          validateFinite(box2.min.x, "box2.min.x"),
          validateFinite(box2.min.y, "box2.min.y"),
          validateFinite(box2.min.z, "box2.min.z"),
          validateFinite(box2.max.x, "box2.max.x"),
          validateFinite(box2.max.y, "box2.max.y"),
          validateFinite(box2.max.z, "box2.max.z"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("check collision boxes", () => {
          return this.rl.CheckCollisionBoxesWrapper(box1.min.x,
            box1.min.y,
            box1.min.z,
            box1.max.x,
            box1.max.y,
            box1.max.z,
            box2.min.x,
            box2.min.y,
            box2.min.z,
            box2.max.x,
            box2.max.y,
            box2.max.z);
        }),
      );
  }

  public checkCollisionBoxSphere(
    box: BoundingBox,
    center: Vector3,
    radius: number,
  ): RaylibResult<boolean> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(box.min.x, "box.min.x"),
          validateFinite(box.min.y, "box.min.y"),
          validateFinite(box.min.z, "box.min.z"),
          validateFinite(box.max.x, "box.max.x"),
          validateFinite(box.max.y, "box.max.y"),
          validateFinite(box.max.z, "box.max.z"),
          validateFinite(center.x, "center.x"),
          validateFinite(center.y, "center.y"),
          validateFinite(center.z, "center.z"),
          validateNonNegative(radius, "radius"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("check collision box sphere", () => {
          return this.rl.CheckCollisionBoxSphereWrapper(
            box.min.x,
            box.min.y,
            box.min.z,
            box.max.x,
            box.max.y,
            box.max.z,
            center.x,
            center.y,
            center.z,
            radius,
          );
        }),
      );
  }

  public getRayCollisionSphere(
    rayPosition: Vector3,
    rayDirection: Vector3,
    center: Vector3,
    radius: number,
  ): RaylibResult<RayCollision> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(rayPosition.x, "rayPosition.x"),
          validateFinite(rayPosition.y, "rayPosition.y"),
          validateFinite(rayPosition.z, "rayPosition.z"),
          validateFinite(rayDirection.x, "rayDirection.x"),
          validateFinite(rayDirection.y, "rayDirection.y"),
          validateFinite(rayDirection.z, "rayDirection.z"),
          validateFinite(center.x, "center.x"),
          validateFinite(center.y, "center.y"),
          validateFinite(center.z, "center.z"),
          validateNonNegative(radius, "radius"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("get ray collision sphere", () => {
          // Create Ray structure as Float32Array
          const rayArray = new Float32Array(6);
          rayArray[0] = rayPosition.x;
          rayArray[1] = rayPosition.y;
          rayArray[2] = rayPosition.z;
          rayArray[3] = rayDirection.x;
          rayArray[4] = rayDirection.y;
          rayArray[5] = rayDirection.z;

          const outBuffer = new Float32Array(8);
          this.rl.GetRayCollisionSphereWrapper(
            ptr(rayArray),
            center.x,
            center.y,
            center.z,
            radius,
            ptr(outBuffer),
          );

          return {
            hit: outBuffer[0]! !== 0,
            distance: outBuffer[1]!,
            point: {
              x: outBuffer[2]!,
              y: outBuffer[3]!,
              z: outBuffer[4]!,
            },
            normal: {
              x: outBuffer[5]!,
              y: outBuffer[6]!,
              z: outBuffer[7]!,
            },
          };
        }),
      );
  }

  public getRayCollisionBox(
    rayPosition: Vector3,
    rayDirection: Vector3,
    box: BoundingBox,
  ): RaylibResult<RayCollision> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(rayPosition.x, "rayPosition.x"),
          validateFinite(rayPosition.y, "rayPosition.y"),
          validateFinite(rayPosition.z, "rayPosition.z"),
          validateFinite(rayDirection.x, "rayDirection.x"),
          validateFinite(rayDirection.y, "rayDirection.y"),
          validateFinite(rayDirection.z, "rayDirection.z"),
          validateFinite(box.min.x, "box.min.x"),
          validateFinite(box.min.y, "box.min.y"),
          validateFinite(box.min.z, "box.min.z"),
          validateFinite(box.max.x, "box.max.x"),
          validateFinite(box.max.y, "box.max.y"),
          validateFinite(box.max.z, "box.max.z"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("get ray collision box", () => {
          // Create Ray structure as Float32Array
          const rayArray = new Float32Array(6);
          rayArray[0] = rayPosition.x;
          rayArray[1] = rayPosition.y;
          rayArray[2] = rayPosition.z;
          rayArray[3] = rayDirection.x;
          rayArray[4] = rayDirection.y;
          rayArray[5] = rayDirection.z;

          // Create BoundingBox structure as Float32Array
          const boxArray = new Float32Array(6);
          boxArray[0] = box.min.x;
          boxArray[1] = box.min.y;
          boxArray[2] = box.min.z;
          boxArray[3] = box.max.x;
          boxArray[4] = box.max.y;
          boxArray[5] = box.max.z;

          const outBuffer = new Float32Array(8);
          this.rl.GetRayCollisionBoxWrapper(
            ptr(rayArray),
            ptr(boxArray),
            ptr(outBuffer),
          );

          return {
            hit: outBuffer[0]! !== 0,
            distance: outBuffer[1]!,
            point: {
              x: outBuffer[2]!,
              y: outBuffer[3]!,
              z: outBuffer[4]!,
            },
            normal: {
              x: outBuffer[5]!,
              y: outBuffer[6]!,
              z: outBuffer[7]!,
            },
          };
        }),
      );
  }

  // Shader loading and management
  public loadShader(vsFileName: string, fsFileName: string): RaylibResult<Shader> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateNonEmptyString(vsFileName, "vsFileName"),
          validateNonEmptyString(fsFileName, "fsFileName"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("load shader to slot", () => {
          const vsFileNameBuffer = this.textEncoder.encode(vsFileName + "\0");
          const fsFileNameBuffer = this.textEncoder.encode(fsFileName + "\0");
          const vsFileNamePtr = ptr(vsFileNameBuffer);
          const fsFileNamePtr = ptr(fsFileNameBuffer);

          const slotIndex = this.rl.LoadShaderToSlot(vsFileNamePtr, fsFileNamePtr);

          if (slotIndex < 0) {
            throw new Error(
              "Failed to load shader or no free slots available",
            );
          }

          return { slotIndex };
        }),
      );
  }

  public loadShaderFromMemory(vsCode: string, fsCode: string): RaylibResult<Shader> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateNonEmptyString(vsCode, "vsCode"),
          validateNonEmptyString(fsCode, "fsCode"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("load shader from memory to slot", () => {
          const vsCodeBuffer = this.textEncoder.encode(vsCode + "\0");
          const fsCodeBuffer = this.textEncoder.encode(fsCode + "\0");
          const vsCodePtr = ptr(vsCodeBuffer);
          const fsCodePtr = ptr(fsCodeBuffer);

          const slotIndex = this.rl.LoadShaderFromMemoryToSlot(vsCodePtr, fsCodePtr);

          if (slotIndex < 0) {
            throw new Error(
              "Failed to compile shader or no free slots available",
            );
          }

          return { slotIndex };
        }),
      );
  }

  public unloadShader(shader: Shader): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() => validateFinite(shader.slotIndex, "shader.slotIndex"))
      .andThen(() => {
        if (shader.slotIndex < 0) {
          return new Err(validationError("Invalid shader slot index"));
        }
        return this.safeFFICall("unload shader from slot", () => {
          this.rl.UnloadShaderBySlot(shader.slotIndex);
        });
      });
  }

  public unloadAllShaders(): RaylibResult<void> {
    return this.requireInitialized().andThen(() =>
      this.safeFFICall("unload all shaders", () => {
        this.rl.UnloadAllShaders();
      }),
    );
  }

  public isShaderValid(shader: Shader): RaylibResult<boolean> {
    return this.requireInitialized()
      .andThen(() => validateFinite(shader.slotIndex, "shader.slotIndex"))
      .andThen(() =>
        this.safeFFICall("check shader slot validity", () => {
          return this.rl.IsShaderSlotValid(shader.slotIndex);
        }),
      );
  }

  public getLoadedShaderCount(): RaylibResult<number> {
    return this.requireInitialized().andThen(() =>
      this.safeFFICall("get loaded shader count", () => {
        return this.rl.GetLoadedShaderCount();
      }),
    );
  }

  // Shader mode control
  public beginShaderMode(shader: Shader): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() => validateFinite(shader.slotIndex, "shader.slotIndex"))
      .andThen(() => {
        if (shader.slotIndex < 0) {
          return new Err(validationError("Invalid shader slot index"));
        }
        return this.safeFFICall("begin shader mode", () => {
          this.rl.BeginShaderModeBySlot(shader.slotIndex);
        });
      });
  }

  public endShaderMode(): RaylibResult<void> {
    return this.requireInitialized().andThen(() =>
      this.safeFFICall("end shader mode", () => {
        this.rl.EndShaderModeWrapper();
      }),
    );
  }

  // Uniform management
  public getShaderLocation(shader: Shader, uniformName: string): RaylibResult<number> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(shader.slotIndex, "shader.slotIndex"),
          validateNonEmptyString(uniformName, "uniformName"),
        ),
      )
      .andThen(() => {
        if (shader.slotIndex < 0) {
          return new Err(validationError("Invalid shader slot index"));
        }
        return this.safeFFICall("get shader location", () => {
          const uniformNameBuffer = this.textEncoder.encode(uniformName + "\0");
          const uniformNamePtr = ptr(uniformNameBuffer);
          const location = this.rl.GetShaderLocationBySlot(shader.slotIndex, uniformNamePtr);
          return location;
        });
      });
  }

  public setShaderValueFloat(shader: Shader, locIndex: number, value: number): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(shader.slotIndex, "shader.slotIndex"),
          validateFinite(locIndex, "locIndex"),
          validateFinite(value, "value"),
        ),
      )
      .andThen(() => {
        if (shader.slotIndex < 0) {
          return new Err(validationError("Invalid shader slot index"));
        }
        return this.safeFFICall("set shader value float", () => {
          this.rl.SetShaderValueFloatBySlot(shader.slotIndex, locIndex, value);
        });
      });
  }

  public setShaderValueInt(shader: Shader, locIndex: number, value: number): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(shader.slotIndex, "shader.slotIndex"),
          validateFinite(locIndex, "locIndex"),
          validateFinite(value, "value"),
        ),
      )
      .andThen(() => {
        if (shader.slotIndex < 0) {
          return new Err(validationError("Invalid shader slot index"));
        }
        return this.safeFFICall("set shader value int", () => {
          this.rl.SetShaderValueIntBySlot(shader.slotIndex, locIndex, Math.floor(value));
        });
      });
  }

  public setShaderValueVec2(shader: Shader, locIndex: number, value: Vector2): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(shader.slotIndex, "shader.slotIndex"),
          validateFinite(locIndex, "locIndex"),
          validateFinite(value.x, "value.x"),
          validateFinite(value.y, "value.y"),
        ),
      )
      .andThen(() => {
        if (shader.slotIndex < 0) {
          return new Err(validationError("Invalid shader slot index"));
        }
        return this.safeFFICall("set shader value vec2", () => {
          this.rl.SetShaderValueVec2BySlot(shader.slotIndex, locIndex, value.x, value.y);
        });
      });
  }

  public setShaderValueVec3(shader: Shader, locIndex: number, value: Vector3): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(shader.slotIndex, "shader.slotIndex"),
          validateFinite(locIndex, "locIndex"),
          validateFinite(value.x, "value.x"),
          validateFinite(value.y, "value.y"),
          validateFinite(value.z, "value.z"),
        ),
      )
      .andThen(() => {
        if (shader.slotIndex < 0) {
          return new Err(validationError("Invalid shader slot index"));
        }
        return this.safeFFICall("set shader value vec3", () => {
          this.rl.SetShaderValueVec3BySlot(shader.slotIndex, locIndex, value.x, value.y, value.z);
        });
      });
  }

  public setShaderValueVec4(shader: Shader, locIndex: number, x: number, y: number, z: number, w: number): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(shader.slotIndex, "shader.slotIndex"),
          validateFinite(locIndex, "locIndex"),
          validateFinite(x, "x"),
          validateFinite(y, "y"),
          validateFinite(z, "z"),
          validateFinite(w, "w"),
        ),
      )
      .andThen(() => {
        if (shader.slotIndex < 0) {
          return new Err(validationError("Invalid shader slot index"));
        }
        return this.safeFFICall("set shader value vec4", () => {
          this.rl.SetShaderValueVec4BySlot(shader.slotIndex, locIndex, x, y, z, w);
        });
      });
  }

  public setShaderValueTexture(shader: Shader, locIndex: number, textureSlot: number): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(shader.slotIndex, "shader.slotIndex"),
          validateFinite(locIndex, "locIndex"),
          validateFinite(textureSlot, "textureSlot"),
        ),
      )
      .andThen(() => {
        if (shader.slotIndex < 0) {
          return new Err(validationError("Invalid shader slot index"));
        }
        if (textureSlot < 0) {
          return new Err(validationError("Invalid texture slot index"));
        }
        return this.safeFFICall("set shader value texture", () => {
          this.rl.SetShaderValueTextureBySlot(shader.slotIndex, locIndex, textureSlot);
        });
      });
  }

  // Blend mode control
  public beginBlendMode(mode: BlendMode): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() => validateFinite(mode, "mode"))
      .andThen(() => {
        // Validate blend mode is within valid range
        if (mode < BlendMode.ALPHA || mode > BlendMode.CUSTOM_SEPARATE) {
          return new Err(validationError("Invalid blend mode value"));
        }
        return this.safeFFICall("begin blend mode", () => {
          this.rl.BeginBlendModeWrapper(mode);
        });
      });
  }

  public endBlendMode(): RaylibResult<void> {
    return this.requireInitialized().andThen(() =>
      this.safeFFICall("end blend mode", () => {
        this.rl.EndBlendModeWrapper();
      }),
    );
  }

  // Scissor mode control
  public beginScissorMode(x: number, y: number, width: number, height: number): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(x, "x"),
          validateFinite(y, "y"),
          validateNonNegative(width, "width"),
          validateNonNegative(height, "height"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("begin scissor mode", () => {
          this.rl.BeginScissorModeWrapper(Math.floor(x), Math.floor(y), Math.floor(width), Math.floor(height));
        }),
      );
  }

  public endScissorMode(): RaylibResult<void> {
    return this.requireInitialized().andThen(() =>
      this.safeFFICall("end scissor mode", () => {
        this.rl.EndScissorModeWrapper();
      }),
    );
  }

  public getRayCollisionTriangle(
    rayPosition: Vector3,
    rayDirection: Vector3,
    p1: Vector3,
    p2: Vector3,
    p3: Vector3,
  ): RaylibResult<RayCollision> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(rayPosition.x, "rayPosition.x"),
          validateFinite(rayPosition.y, "rayPosition.y"),
          validateFinite(rayPosition.z, "rayPosition.z"),
          validateFinite(rayDirection.x, "rayDirection.x"),
          validateFinite(rayDirection.y, "rayDirection.y"),
          validateFinite(rayDirection.z, "rayDirection.z"),
          validateFinite(p1.x, "p1.x"),
          validateFinite(p1.y, "p1.y"),
          validateFinite(p1.z, "p1.z"),
          validateFinite(p2.x, "p2.x"),
          validateFinite(p2.y, "p2.y"),
          validateFinite(p2.z, "p2.z"),
          validateFinite(p3.x, "p3.x"),
          validateFinite(p3.y, "p3.y"),
          validateFinite(p3.z, "p3.z"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("get ray collision triangle optimized", () => {
          // Create Ray structure as Float32Array
          const rayArray = new Float32Array(6);
          rayArray[0] = rayPosition.x;
          rayArray[1] = rayPosition.y;
          rayArray[2] = rayPosition.z;
          rayArray[3] = rayDirection.x;
          rayArray[4] = rayDirection.y;
          rayArray[5] = rayDirection.z;

          const outBuffer = new Float32Array(8);
          this.rl.GetRayCollisionTriangleWrapper(
            ptr(rayArray),
            p1.x,
            p1.y,
            p1.z,
            p2.x,
            p2.y,
            p2.z,
            p3.x,
            p3.y,
            p3.z,
            ptr(outBuffer),
          );

          return {
            hit: outBuffer[0]! !== 0,
            distance: outBuffer[1]!,
            point: {
              x: outBuffer[2]!,
              y: outBuffer[3]!,
              z: outBuffer[4]!,
            },
            normal: {
              x: outBuffer[5]!,
              y: outBuffer[6]!,
              z: outBuffer[7]!,
            },
          };
        }),
      );
  }

  public getRayCollisionMesh(
    rayPosition: Vector3,
    rayDirection: Vector3,
    model: Model,
    meshIndex: number,
    transform?: Matrix,
  ): RaylibResult<RayCollision> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(rayPosition.x, "rayPosition.x"),
          validateFinite(rayPosition.y, "rayPosition.y"),
          validateFinite(rayPosition.z, "rayPosition.z"),
          validateFinite(rayDirection.x, "rayDirection.x"),
          validateFinite(rayDirection.y, "rayDirection.y"),
          validateFinite(rayDirection.z, "rayDirection.z"),
          validateFinite(model.slotIndex, "model.slotIndex"),
          validateFinite(meshIndex, "meshIndex"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("get ray collision mesh", () => {
          // Create Ray structure as Float32Array
          const rayArray = new Float32Array(6);
          rayArray[0] = rayPosition.x;
          rayArray[1] = rayPosition.y;
          rayArray[2] = rayPosition.z;
          rayArray[3] = rayDirection.x;
          rayArray[4] = rayDirection.y;
          rayArray[5] = rayDirection.z;

          // Create transform matrix if provided, otherwise use identity
          let transformArray: Float32Array | null = null;
          if (transform) {
            transformArray = new Float32Array(16);
            transformArray[0] = transform.m0;
            transformArray[1] = transform.m1;
            transformArray[2] = transform.m2;
            transformArray[3] = transform.m3;
            transformArray[4] = transform.m4;
            transformArray[5] = transform.m5;
            transformArray[6] = transform.m6;
            transformArray[7] = transform.m7;
            transformArray[8] = transform.m8;
            transformArray[9] = transform.m9;
            transformArray[10] = transform.m10;
            transformArray[11] = transform.m11;
            transformArray[12] = transform.m12;
            transformArray[13] = transform.m13;
            transformArray[14] = transform.m14;
            transformArray[15] = transform.m15;
          }

          // Output buffer for collision result
          const outBuffer = new Float32Array(8);

          // Call the wrapper function
          this.rl.GetRayCollisionModelMesh(
            ptr(rayArray),
            model.slotIndex,
            meshIndex,
            transformArray ? ptr(transformArray) : null,
            ptr(outBuffer),
          );

          return {
            hit: outBuffer[0]! !== 0,
            distance: outBuffer[1]!,
            point: {
              x: outBuffer[2]!,
              y: outBuffer[3]!,
              z: outBuffer[4]!,
            },
            normal: {
              x: outBuffer[5]!,
              y: outBuffer[6]!,
              z: outBuffer[7]!,
            },
          };
        }),
      );
  }

  // Font loading and management
  public loadFont(fileName: string, fontSize: number): RaylibResult<Font> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateNonEmptyString(fileName, "fileName"),
          validatePositive(fontSize, "fontSize"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("load font to slot", () => {
          const fileNameBuffer = this.textEncoder.encode(fileName + "\0");
          const fileNamePtr = ptr(fileNameBuffer);

          const slotIndex = this.rl.LoadFontToSlot(fileNamePtr, fontSize);

          if (slotIndex < 0) {
            throw new Error(
              "Failed to load font or no free slots available",
            );
          }

          // Get font metadata
          const dataBuffer = new Int32Array(2);
          this.rl.GetFontDataBySlot(slotIndex, ptr(dataBuffer));

          return {
            slotIndex,
            baseSize: dataBuffer[0]!,
            glyphCount: dataBuffer[1]!,
          };
        }),
      );
  }

  public unloadFont(font: Font): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() => validateFinite(font.slotIndex, "font.slotIndex"))
      .andThen(() => {
        if (font.slotIndex < 0) {
          return new Err(validationError("Invalid font slot index"));
        }
        return this.safeFFICall("unload font from slot", () => {
          this.rl.UnloadFontBySlot(font.slotIndex);
        });
      });
  }

  public isFontValid(font: Font): RaylibResult<boolean> {
    return this.requireInitialized()
      .andThen(() => validateFinite(font.slotIndex, "font.slotIndex"))
      .andThen(() =>
        this.safeFFICall("check font slot validity", () => {
          return this.rl.IsFontSlotValid(font.slotIndex);
        }),
      );
  }

  public getLoadedFontCount(): RaylibResult<number> {
    return this.requireInitialized().andThen(() =>
      this.safeFFICall("get loaded font count", () => {
        return this.rl.GetLoadedFontCount();
      }),
    );
  }

  public unloadAllFonts(): RaylibResult<void> {
    return this.requireInitialized().andThen(() =>
      this.safeFFICall("unload all fonts", () => {
        this.rl.UnloadAllFonts();
      }),
    );
  }

  // Text measurement methods
  public measureText(text: string, fontSize: number): RaylibResult<TextMeasurement> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateNonEmptyString(text, "text"),
          validatePositive(fontSize, "fontSize"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("measure text", () => {
          const textBuffer = this.textEncoder.encode(text + "\0");
          const textPtr = ptr(textBuffer);

          // Use slot index 0 for default font
          const outBuffer = new Float32Array(2);
          this.rl.MeasureTextBySlot(0, textPtr, fontSize, 1.0, ptr(outBuffer));

          return {
            width: outBuffer[0]!,
            height: outBuffer[1]!,
          };
        }),
      );
  }

  public measureTextEx(
    font: Font,
    text: string,
    fontSize: number,
    spacing: number,
  ): RaylibResult<TextMeasurement> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(font.slotIndex, "font.slotIndex"),
          validateNonEmptyString(text, "text"),
          validatePositive(fontSize, "fontSize"),
          validateFinite(spacing, "spacing"),
        ),
      )
      .andThen(() => {
        if (font.slotIndex < 0) {
          return new Err(validationError("Invalid font slot index"));
        }
        return this.safeFFICall("measure text ex", () => {
          const textBuffer = this.textEncoder.encode(text + "\0");
          const textPtr = ptr(textBuffer);

          const outBuffer = new Float32Array(2);
          this.rl.MeasureTextBySlot(
            font.slotIndex,
            textPtr,
            fontSize,
            spacing,
            ptr(outBuffer),
          );

          return {
            width: outBuffer[0]!,
            height: outBuffer[1]!,
          };
        });
      });
  }

  // Text rendering methods
  public drawTextEx(
    font: Font,
    text: string,
    position: Vector2,
    fontSize: number,
    spacing: number,
    color: number,
  ): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(font.slotIndex, "font.slotIndex"),
          validateNonEmptyString(text, "text"),
          validateFinite(position.x, "position.x"),
          validateFinite(position.y, "position.y"),
          validatePositive(fontSize, "fontSize"),
          validateFinite(spacing, "spacing"),
          validateColor(color, "color"),
        ),
      )
      .andThen(() => {
        if (font.slotIndex < 0) {
          return new Err(validationError("Invalid font slot index"));
        }
        return this.safeFFICall("draw text ex", () => {
          const textBuffer = this.textEncoder.encode(text + "\0");
          const textPtr = ptr(textBuffer);

          this.rl.DrawTextBySlot(
            font.slotIndex,
            textPtr,
            position.x,
            position.y,
            fontSize,
            spacing,
            color,
          );
        });
      });
  }

  // Text wrapping methods
  public wrapText(
    text: string,
    maxWidth: number,
    fontSize: number,
  ): RaylibResult<string> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateNonEmptyString(text, "text"),
          validatePositive(maxWidth, "maxWidth"),
          validatePositive(fontSize, "fontSize"),
        ),
      )
      .andThen(() =>
        this.safeFFICall("wrap text", () => {
          const textBuffer = this.textEncoder.encode(text + "\0");
          const textPtr = ptr(textBuffer);

          // Allocate buffer for wrapped text (4x input length to be safe)
          const bufferSize = text.length * 4;
          const outBuffer = new Uint8Array(bufferSize);
          const outPtr = ptr(outBuffer);

          // Use slot index 0 for default font
          const lineCount = this.rl.WrapTextBySlot(
            0,
            textPtr,
            fontSize,
            1.0,
            maxWidth,
            outPtr,
            bufferSize,
          );

          if (lineCount < 0) {
            throw new Error("Failed to wrap text");
          }

          // Decode buffer to string
          const nullIndex = outBuffer.indexOf(0);
          const wrappedText = new TextDecoder().decode(
            outBuffer.slice(0, nullIndex >= 0 ? nullIndex : outBuffer.length),
          );

          return wrappedText;
        }),
      );
  }

  public wrapTextEx(
    font: Font,
    text: string,
    maxWidth: number,
    fontSize: number,
    spacing: number,
  ): RaylibResult<string> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(font.slotIndex, "font.slotIndex"),
          validateNonEmptyString(text, "text"),
          validatePositive(maxWidth, "maxWidth"),
          validatePositive(fontSize, "fontSize"),
          validateFinite(spacing, "spacing"),
        ),
      )
      .andThen(() => {
        if (font.slotIndex < 0) {
          return new Err(validationError("Invalid font slot index"));
        }
        return this.safeFFICall("wrap text ex", () => {
          const textBuffer = this.textEncoder.encode(text + "\0");
          const textPtr = ptr(textBuffer);

          // Allocate buffer for wrapped text (4x input length to be safe)
          const bufferSize = text.length * 4;
          const outBuffer = new Uint8Array(bufferSize);
          const outPtr = ptr(outBuffer);

          const lineCount = this.rl.WrapTextBySlot(
            font.slotIndex,
            textPtr,
            fontSize,
            spacing,
            maxWidth,
            outPtr,
            bufferSize,
          );

          if (lineCount < 0) {
            throw new Error("Failed to wrap text");
          }

          // Decode buffer to string
          const nullIndex = outBuffer.indexOf(0);
          const wrappedText = new TextDecoder().decode(
            outBuffer.slice(0, nullIndex >= 0 ? nullIndex : outBuffer.length),
          );

          return wrappedText;
        });
      });
  }

  // Text formatting and alignment
  public drawTextFormatted(
    font: Font,
    text: string,
    position: Vector2,
    options: TextFormatOptions,
    color: number,
  ): RaylibResult<void> {
    return this.requireInitialized()
      .andThen(() =>
        validateAll(
          validateFinite(font.slotIndex, "font.slotIndex"),
          validateNonEmptyString(text, "text"),
          validateFinite(position.x, "position.x"),
          validateFinite(position.y, "position.y"),
          validateColor(color, "color"),
        ),
      )
      .andThen(() => {
        if (font.slotIndex < 0) {
          return new Err(validationError("Invalid font slot index"));
        }

        // Apply default values for optional fields
        const fontSize = options.fontSize ?? font.baseSize;
        const spacing = options.spacing ?? 1.0;
        const lineSpacing = options.lineSpacing ?? fontSize;
        const alignment = options.alignment ?? TextAlignment.LEFT;
        const maxWidth = options.maxWidth;
        const wordWrap = options.wordWrap ?? false;

        // Validate options
        const optionsValidation = validateAll(
          validatePositive(fontSize, "fontSize"),
          validateFinite(spacing, "spacing"),
          validatePositive(lineSpacing, "lineSpacing"),
        );

        if (optionsValidation.isErr()) {
          return optionsValidation;
        }

        return this.safeFFICall("draw text formatted", () => {
          let textToDraw = text;

          // Wrap text if maxWidth and wordWrap are specified
          if (maxWidth !== undefined && wordWrap) {
            const wrapResult = this.wrapTextEx(
              font,
              text,
              maxWidth,
              fontSize,
              spacing,
            );
            if (wrapResult.isErr()) {
              throw new Error("Failed to wrap text");
            }
            textToDraw = wrapResult.unwrap();
          }

          // Split text into lines by \n
          const lines = textToDraw.split("\n");

          // Render each line with alignment
          let currentY = position.y;
          for (const line of lines) {
            if (line.length === 0) {
              currentY += lineSpacing;
              continue;
            }

            // Calculate x position based on alignment
            let currentX = position.x;
            if (alignment !== TextAlignment.LEFT && maxWidth !== undefined) {
              const measureResult = this.measureTextEx(
                font,
                line,
                fontSize,
                spacing,
              );
              if (measureResult.isOk()) {
                const lineWidth = measureResult.unwrap().width;
                if (alignment === TextAlignment.CENTER) {
                  currentX = position.x + (maxWidth - lineWidth) / 2;
                } else if (alignment === TextAlignment.RIGHT) {
                  currentX = position.x + (maxWidth - lineWidth);
                }
              }
            }

            // Draw the line
            const drawResult = this.drawTextEx(
              font,
              line,
              new Vector2(currentX, currentY),
              fontSize,
              spacing,
              color,
            );
            if (drawResult.isErr()) {
              throw new Error("Failed to draw text line");
            }

            currentY += lineSpacing;
          }
        });
      });
  }
}
