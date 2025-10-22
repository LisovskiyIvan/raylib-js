import { Raylib, Vector3, Vector2, Colors, kb } from '../src/index'

const rl = new Raylib()

// Initialize window
const initResult = rl.initWindow(1200, 800, "3D WASD Camera Control")
if (initResult.isErr()) {
    console.error("Failed to initialize window:", initResult.error.message)
    process.exit(1)
}

// rl.setTargetFPS(60)

// Camera settings
let cameraPosition = new Vector3(0, 2, 5)
let cameraTarget = new Vector3(0, 0, 0)
const cameraUp = Vector3.Up()
const fovy = 60.0
const projection = 0 // CAMERA_PERSPECTIVE

// Movement settings
const moveSpeed = 5.0
let yaw = 0.0 // Horizontal rotation
let pitch = 0.0 // Vertical rotation

// Mouse settings
let lastMousePos = new Vector2(0, 0)
let firstMouse = true
const mouseSensitivity = 0.1
rl.disableCursor()
// Main game loop
while (!rl.windowShouldClose().unwrap()) {
    
    const deltaTime = rl.getFrameTime().unwrap()
    
    // Mouse look
    const mousePos = rl.getMousePosition().unwrap()
    if (firstMouse) {
        lastMousePos = mousePos
        firstMouse = false
    }
    
    const mouseDelta = new Vector2(
        mousePos.x - lastMousePos.x,
        lastMousePos.y - mousePos.y // Reversed since y-coordinates go from bottom to top
    )
    lastMousePos = mousePos
    
    yaw += mouseDelta.x * mouseSensitivity
    pitch += mouseDelta.y * mouseSensitivity
    
    // Constrain pitch
    if (pitch > 89.0) pitch = 89.0
    if (pitch < -89.0) pitch = -89.0
    
    // Calculate camera direction
    const yawRad = yaw * Math.PI / 180
    const pitchRad = pitch * Math.PI / 180
    
    const front = new Vector3(
        Math.cos(yawRad) * Math.cos(pitchRad),
        Math.sin(pitchRad),
        Math.sin(yawRad) * Math.cos(pitchRad)
    ).normalize()
    
    const right = front.cross(cameraUp).normalize()
    // WASD movement
    let velocity = new Vector3(0, 0, 0)
    
    if (rl.isKeyDown(kb.KEY_W).unwrap()) {
        velocity = velocity.add(front.scale(moveSpeed * deltaTime))
    }
    if (rl.isKeyDown(kb.KEY_S).unwrap()) {
        velocity = velocity.subtract(front.scale(moveSpeed * deltaTime))
    }
    if (rl.isKeyDown(kb.KEY_A).unwrap()) {
        velocity = velocity.subtract(right.scale(moveSpeed * deltaTime))
    }
    if (rl.isKeyDown(kb.KEY_D).unwrap()) {
        velocity = velocity.add(right.scale(moveSpeed * deltaTime))
    }
    if (rl.isKeyDown(kb.KEY_SPACE).unwrap()) {
        velocity = velocity.add(cameraUp.scale(moveSpeed * deltaTime))
    }
    if (rl.isKeyDown(kb.KEY_LEFT_SHIFT).unwrap()) {
        velocity = velocity.subtract(cameraUp.scale(moveSpeed * deltaTime))
    }
    
    // Apply movement
    cameraPosition = cameraPosition.add(velocity)
    cameraTarget = cameraPosition.add(front)
    
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
    rl.drawGrid(20, 1.0)

    // Create a scene with various objects to look at
    
    // Central tower
    for (let i = 0; i < 5; i++) {
        const cubePos = new Vector3(0, i * 2 + 1, 0)
        const color = i % 2 === 0 ? Colors.RED : Colors.BLUE
        rl.drawCube(cubePos, 1.5, 2.0, 1.5, color)
    }
    
    // Ring of spheres
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * 2 * Math.PI
        const radius = 8
        const spherePos = new Vector3(
            Math.cos(angle) * radius,
            1,
            Math.sin(angle) * radius
        )
        const color = i % 2 === 0 ? Colors.GREEN : Colors.YELLOW
        rl.drawSphere(spherePos, 1.0, color)
    }
    
    // Some pillars
    const pillarPositions = [
        new Vector3(5, 0, 5),
        new Vector3(-5, 0, 5),
        new Vector3(5, 0, -5),
        new Vector3(-5, 0, -5),
        new Vector3(10, 0, 0),
        new Vector3(-10, 0, 0),
        new Vector3(0, 0, 10),
        new Vector3(0, 0, -10)
    ]
    
    pillarPositions.forEach((pos, index) => {
        const height = 3 + (index % 3) * 2
        const cylinderPos = new Vector3(pos.x, height / 2, pos.z)
        rl.drawCylinder(cylinderPos, 0.5, 0.5, height, 8, Colors.PURPLE)
    })
    
    // Some floating cubes
    for (let x = -15; x <= 15; x += 5) {
        for (let z = -15; z <= 15; z += 5) {
            if (x === 0 && z === 0) continue // Skip center
            const cubePos = new Vector3(x, 4 + Math.sin((x + z) * 0.1) * 2, z)
            rl.drawCube(cubePos, 0.8, 0.8, 0.8, Colors.ORANGE)
        }
    }
    
    // Draw some reference lines
    rl.drawLine3D(new Vector3(-20, 0, 0), new Vector3(20, 0, 0), Colors.RED)
    rl.drawLine3D(new Vector3(0, 0, -20), new Vector3(0, 0, 20), Colors.BLUE)
    rl.drawLine3D(new Vector3(0, 0, 0), new Vector3(0, 10, 0), Colors.GREEN)

    // End 3D mode
    const endResult = rl.endMode3D()
    if (endResult.isErr()) {
        console.error("Failed to end 3D mode:", endResult.error.message)
        break
    }

    // Draw 2D UI
    rl.drawText("3D WASD Camera Control", 10, 10, 24, Colors.BLACK)
    rl.drawText("Controls:", 10, 50, 18, Colors.DARKGRAY)
    rl.drawText("WASD - Move forward/back/left/right", 10, 75, 16, Colors.DARKGRAY)
    rl.drawText("Mouse - Look around", 10, 95, 16, Colors.DARKGRAY)
    rl.drawText("Space - Move up", 10, 115, 16, Colors.DARKGRAY)
    rl.drawText("Shift - Move down", 10, 135, 16, Colors.DARKGRAY)
    rl.drawText("ESC - Exit", 10, 155, 16, Colors.DARKGRAY)
    
    // Camera info
    rl.drawText(`Position: (${cameraPosition.x.toFixed(1)}, ${cameraPosition.y.toFixed(1)}, ${cameraPosition.z.toFixed(1)})`, 10, 190, 14, Colors.BLACK)
    rl.drawText(`Yaw: ${yaw.toFixed(1)}° | Pitch: ${pitch.toFixed(1)}°`, 10, 210, 14, Colors.BLACK)
    
    // Movement indicators
    const wPressed = rl.isKeyDown(kb.KEY_W).unwrap()
    const aPressed = rl.isKeyDown(kb.KEY_A).unwrap()
    const sPressed = rl.isKeyDown(kb.KEY_S).unwrap()
    const dPressed = rl.isKeyDown(kb.KEY_D).unwrap()
    const spacePressed = rl.isKeyDown(kb.KEY_SPACE).unwrap()
    const shiftPressed = rl.isKeyDown(kb.KEY_LEFT_SHIFT).unwrap()
    
    rl.drawText("Movement:", 10, 240, 16, Colors.DARKGRAY)
    rl.drawText(`W: ${wPressed ? 'Forward' : ''}`, 10, 260, 14, wPressed ? Colors.GREEN : Colors.GRAY)
    rl.drawText(`S: ${sPressed ? 'Back' : ''}`, 10, 280, 14, sPressed ? Colors.GREEN : Colors.GRAY)
    rl.drawText(`A: ${aPressed ? 'Left' : ''}`, 10, 300, 14, aPressed ? Colors.GREEN : Colors.GRAY)
    rl.drawText(`D: ${dPressed ? 'Right' : ''}`, 10, 320, 14, dPressed ? Colors.GREEN : Colors.GRAY)
    rl.drawText(`Space: ${spacePressed ? 'Up' : ''}`, 10, 340, 14, spacePressed ? Colors.GREEN : Colors.GRAY)
    rl.drawText(`Shift: ${shiftPressed ? 'Down' : ''}`, 10, 360, 14, shiftPressed ? Colors.GREEN : Colors.GRAY)

    rl.drawFPS(10, 750)
    rl.endDrawing()
}

// Clean up
rl.closeWindow()