import { Colors } from "./raylib-ffi";
import raylib from "./raylib-ffi";
import { CString, ptr } from "bun:ffi";

const title = new CString("Raylib + Bun FFI");
raylib.InitWindow(800, 450, title.ptr);
raylib.SetTargetFPS(60);
const text = new CString("Hello, raylib!");
while (!raylib.WindowShouldClose()) {
  raylib.BeginDrawing();
  raylib.ClearBackground(Colors.WHITE);
  raylib.DrawText(text.ptr, 190, 200, 20, Colors.BLACK);
  raylib.DrawRectangle(100, 100, 200, 150, Colors.RED);
  raylib.EndDrawing();
}
