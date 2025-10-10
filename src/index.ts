import { Colors, kb} from "./constants";
import Raylib from "./Raylib";
import type { Vector2 } from "./types";

const rl = new Raylib()
rl.InitWindow(800, 450, 'Color Test')
rl.SetTargetFPS(60);
const position: Vector2 = {x: 100, y: 100}
while (!rl.WindowShouldClose()) {
  rl.BeginDrawing()
  rl.ClearBackground(Colors.WHITE)  // Белый фон
  rl.DrawFPS(0, 0)
  // Тестируем разные цвета
  rl.DrawRectangle(50, 50, 100, 100, Colors.RED)     // Красный
  rl.DrawRectangle(200, 50, 100, 100, Colors.GREEN)  // Зеленый  
  rl.DrawRectangle(350, 50, 100, 100, Colors.BLUE)   // Синий
  rl.DrawRectangle(500, 50, 100, 100, Colors.YELLOW) // Желтый
  rl.DrawRectangle(200, 200, 100, 100, Colors.BLACK) // Черный


  rl.DrawText(rl.GetMousePosition().x.toString(), position.x, position.y, 20, Colors.GREEN)
  rl.DrawText(rl.GetMouseDelta().x.toString(), position.x + 100, position.y + 100, 20, Colors.RED)
  rl.EndDrawing()
}

rl.CloseWindow()