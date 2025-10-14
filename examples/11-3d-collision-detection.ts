import Raylib from '../src/Raylib'
import Vector3 from '../src/math/Vector3'
import { BoundingBox } from '../src/types'
import { Colors } from '../src/constants'

const rl = new Raylib()

// Initialize window
const result = rl.initWindow(800, 600, "3D Collision Detection Demo")
if (result.isErr()) {
    console.error("Failed to initialize window:", result.error.message)
    process.exit(1)
}

rl.setTargetFPS(60)

// Camera setup
const cameraPosition = new Vector3(10, 10, 10)
const cameraTarget = Vector3.Zero()
const cameraUp = Vector3.Up()
const fovy = 45.0
const projection = 0 // CAMERA_PERSPECTIVE

// Sphere positions and properties
const sphere1Center = new Vector3(-2, 0, 0)
const sphere1Radius = 1.5
let sphere2Center = new Vector3(2, 0, 0)
const sphere2Radius = 1.0

// Box properties
const box1: BoundingBox = {
    min: { x: -1, y: -1, z: -3 },
    max: { x: 1, y: 1, z: -1 }
}

let box2: BoundingBox = {
    min: { x: -0.5, y: -0.5, z: 2 },
    max: { x: 0.5, y: 0.5, z: 3 }
}

// Animation variables
let time = 0

// Main game loop
while (true) {
    const shouldClose = rl.windowShouldClose()
    if (shouldClose.isErr() || shouldClose.unwrap()) break

    const frameTime = rl.getFrameTime().unwrapOr(0.016)
    time += frameTime

    // Animate sphere2 position - circular motion in X-Z plane
    sphere2Center = new Vector3(2 + Math.sin(time) * 3, 0, Math.cos(time) * 3)

    // Animate box2 position - oscillating along X-axis at same Z level as sphere
    const boxOffset = Math.sin(time * 0.8) * 2.5
    box2 = {
        min: { x: -0.5 + boxOffset, y: -0.5, z: -0.5 },
        max: { x: 0.5 + boxOffset, y: 0.5, z: 0.5 }
    }

    // Begin drawing
    rl.beginDrawing()
    rl.clearBackground(Colors.RAYWHITE)

    // Begin 3D mode
    rl.beginMode3D(cameraPosition, cameraTarget, cameraUp, fovy, projection)

    // Draw grid
    rl.drawGrid(10, 1.0)

    // Check and draw sphere-sphere collision
    const sphereCollision = rl.checkCollisionSpheres(sphere1Center, sphere1Radius, sphere2Center, sphere2Radius)
    const sphere2Color = sphereCollision.unwrapOr(false) ? Colors.RED : Colors.BLUE

    rl.drawSphere(sphere1Center, sphere1Radius, Colors.BLUE)
    rl.drawSphere(sphere2Center, sphere2Radius, sphere2Color)

    // Check and draw box-box collision
    const boxCollision = rl.checkCollisionBoxes(box1, box2)
    const box2Color = boxCollision.unwrapOr(false) ? Colors.RED : Colors.GREEN

    // Draw boxes (using cubes to represent bounding boxes)
    const box1Size = new Vector3(
        box1.max.x - box1.min.x,
        box1.max.y - box1.min.y,
        box1.max.z - box1.min.z
    )
    const box1Center = new Vector3(
        (box1.min.x + box1.max.x) / 2,
        (box1.min.y + box1.max.y) / 2,
        (box1.min.z + box1.max.z) / 2
    )
    rl.drawCube(box1Center, box1Size.x, box1Size.y, box1Size.z, Colors.GREEN)

    const box2Size = new Vector3(
        box2.max.x - box2.min.x,
        box2.max.y - box2.min.y,
        box2.max.z - box2.min.z
    )
    const box2Center = new Vector3(
        (box2.min.x + box2.max.x) / 2,
        (box2.min.y + box2.max.y) / 2,
        (box2.min.z + box2.max.z) / 2
    )
    rl.drawCube(box2Center, box2Size.x, box2Size.y, box2Size.z, box2Color)

    // Check and draw box-sphere collisions
    const boxSphereCollision1 = rl.checkCollisionBoxSphere(box1, sphere2Center, sphere2Radius)
    const boxSphereCollision2 = rl.checkCollisionBoxSphere(box2, sphere1Center, sphere1Radius)
    const boxSphereCollision3 = rl.checkCollisionBoxSphere(box2, sphere2Center, sphere2Radius) // Moving box vs moving sphere

    // Draw connection lines if collisions occur
    if (boxSphereCollision1.unwrapOr(false)) {
        rl.drawLine3D(box1Center, sphere2Center, Colors.YELLOW)
    }

    if (boxSphereCollision2.unwrapOr(false)) {
        rl.drawLine3D(box2Center, sphere1Center, Colors.ORANGE)
    }

    if (boxSphereCollision3.unwrapOr(false)) {
        rl.drawLine3D(box2Center, sphere2Center, Colors.BLUE)
    }

    // End 3D mode
    rl.endMode3D()

    // Draw UI information
    rl.drawText("3D Collision Detection Demo", 10, 10, 20, Colors.DARKGRAY)
    rl.drawText("Stable collision detection functions", 10, 40, 16, Colors.DARKGRAY)

    let yOffset = 70
    const sphereHit = sphereCollision.unwrapOr(false)
    const boxHit = boxCollision.unwrapOr(false)
    const boxSphere1Hit = boxSphereCollision1.unwrapOr(false)
    const boxSphere2Hit = boxSphereCollision2.unwrapOr(false)
    const boxSphere3Hit = boxSphereCollision3.unwrapOr(false)

    rl.drawText(`Sphere-Sphere Collision: ${sphereHit ? "YES" : "NO"}`, 10, yOffset, 16, sphereHit ? Colors.RED : Colors.DARKGRAY)
    yOffset += 25
    rl.drawText(`Box-Box Collision: ${boxHit ? "YES" : "NO"}`, 10, yOffset, 16, boxHit ? Colors.RED : Colors.DARKGRAY)
    yOffset += 25
    rl.drawText(`Box1-Sphere2 Collision: ${boxSphere1Hit ? "YES" : "NO"}`, 10, yOffset, 16, boxSphere1Hit ? Colors.YELLOW : Colors.DARKGRAY)
    yOffset += 25
    rl.drawText(`Box2-Sphere1 Collision: ${boxSphere2Hit ? "YES" : "NO"}`, 10, yOffset, 16, boxSphere2Hit ? Colors.ORANGE : Colors.DARKGRAY)
    yOffset += 25
    rl.drawText(`Box2-Sphere2 Collision: ${boxSphere3Hit ? "YES" : "NO"}`, 10, yOffset, 16, boxSphere3Hit ? Colors.PURPLE : Colors.DARKGRAY)

    // Draw collision count
    const totalCollisions = [sphereHit, boxHit, boxSphere1Hit, boxSphere2Hit, boxSphere3Hit].filter(Boolean).length
    yOffset += 40
    rl.drawText(`Total Active Collisions: ${totalCollisions}`, 10, yOffset, 18, Colors.PURPLE)

    // Draw performance info
    yOffset += 40
    rl.drawText(`Frame Time: ${frameTime.toFixed(3)}ms`, 10, yOffset, 16, Colors.DARKGRAY)
    yOffset += 25
    rl.drawText(`Sphere2 Position: (${sphere2Center.x.toFixed(1)}, ${sphere2Center.y.toFixed(1)}, ${sphere2Center.z.toFixed(1)})`, 10, yOffset, 16, Colors.DARKGRAY)

    rl.drawFPS(10, rl.height - 30)
    rl.endDrawing()
}

// Cleanup
rl.closeWindow()
console.log("3D Collision Detection demo completed!")