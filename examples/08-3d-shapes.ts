import { Raylib, Vector3, Vector2, Colors } from '../src/index'

const rl = new Raylib()

// Initialize window
const initResult = rl.initWindow(1000, 700, "3D Shapes Demo")
if (initResult.isErr()) {
    console.error("Failed to initialize window:", initResult.error.message)
    process.exit(1)
}

rl.setTargetFPS(60)

// Camera setup
let cameraAngle = 0
const cameraDistance = 8

let frameCount = 0

// Main game loop
while (!rl.windowShouldClose().unwrap()) {
    frameCount++
    cameraAngle += 0.01 // Rotate camera slowly
    
    // Calculate camera position in a circle
    const cameraPosition = new Vector3(
        Math.cos(cameraAngle) * cameraDistance,
        4,
        Math.sin(cameraAngle) * cameraDistance
    )
    const cameraTarget = Vector3.Zero()
    const cameraUp = Vector3.Up()
    const fovy = 60.0
    const projection = 0 // CAMERA_PERSPECTIVE

    // Begin drawing
    rl.beginDrawing()
    rl.clearBackground(Colors.RAYWHITE)

    // Begin 3D mode
    const beginResult = rl.beginMode3D(cameraPosition, cameraTarget, cameraUp, fovy, projection)
    if (beginResult.isErr()) {
        console.error("Failed to begin 3D mode:", beginResult.error.message)
        break
    }

    // Draw grid for reference
    rl.drawGrid(10, 1.0)

    // Draw cube at center
    const cubePos = new Vector3(0, 1, 0)
    rl.drawCube(cubePos, 1.0, 2.0, 1.0, Colors.RED)

    // Draw cube using vector size
    const cubePos2 = new Vector3(-3, 0.5, 0)
    const cubeSize = new Vector3(1.0, 1.0, 1.0)
    rl.drawCubeV(cubePos2, cubeSize, Colors.BLUE)

    // Draw sphere
    const spherePos = new Vector3(3, 1, 0)
    rl.drawSphere(spherePos, 1.0, Colors.GREEN)

    // Draw cylinder
    const cylinderPos = new Vector3(0, 0, 3)
    rl.drawCylinder(cylinderPos, 0.5, 0.8, 2.0, 8, Colors.PURPLE)

    // Draw capsule
    const capsuleStart = new Vector3(-3, 0, 3)
    const capsuleEnd = new Vector3(-3, 2, 3)
    rl.drawCapsule(capsuleStart, capsuleEnd, 0.3, 8, 8, Colors.ORANGE)

    // Draw plane
    const planePos = new Vector3(3, 0, 3)
    const planeSize = new Vector2(2.0, 2.0)
    rl.drawPlane(planePos, planeSize, Colors.YELLOW)

    // Draw ray
    const rayPos = new Vector3(0, 2, -3)
    const rayDir = new Vector3(0, -1, 1).normalize()
    rl.drawRay(rayPos, rayDir, Colors.PURPLE)

    // Draw some basic 3D primitives for comparison
    const lineStart = new Vector3(-4, 0, -3)
    const lineEnd = new Vector3(-2, 2, -3)
    rl.drawLine3D(lineStart, lineEnd, Colors.BLACK)

    const point = new Vector3(4, 2, -3)
    rl.drawPoint3D(point, Colors.BLUE)

    // End 3D mode
    const endResult = rl.endMode3D()
    if (endResult.isErr()) {
        console.error("Failed to end 3D mode:", endResult.error.message)
        break
    }

    // Draw 2D UI
    rl.drawText("3D Shapes Demo - Camera Rotating", 10, 10, 20, Colors.DARKGRAY)
    rl.drawText("Red Cube | Blue Cube | Green Sphere", 10, 40, 16, Colors.DARKGRAY)
    rl.drawText("Purple Cylinder | Orange Capsule | Yellow Plane", 10, 60, 16, Colors.DARKGRAY)
    rl.drawText("Purple Ray | Black Line | Blue Point", 10, 80, 16, Colors.DARKGRAY)
    rl.drawText(`Frame: ${frameCount} | Camera Angle: ${(cameraAngle * 180 / Math.PI).toFixed(1)}°`, 10, 110, 16, Colors.DARKGRAY)

    rl.endDrawing()
}

// Clean up
rl.closeWindow()