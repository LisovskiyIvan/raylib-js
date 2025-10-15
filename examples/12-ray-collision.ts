import Raylib from '../src/Raylib'
import Vector3 from '../src/math/Vector3'
import { BoundingBox } from '../src/types'
import { Colors } from '../src/constants'

const rl = new Raylib()

// Initialize window
const result = rl.initWindow(800, 600, "Ray Collision Detection Demo")
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

// Ray setup - starting from origin, shooting outward
const rayPosition = Vector3.Zero()

// Sphere properties
const sphereCenter = new Vector3(0, 0, 0)
const sphereRadius = 1.5

// Box properties
const box: BoundingBox = {
    min: { x: -1, y: -1, z: -3 },
    max: { x: 1, y: 1, z: -1 }
}

// Triangle vertices
const triangleP1 = new Vector3(-2, 0, 2)
const triangleP2 = new Vector3(0, 2, 2)
const triangleP3 = new Vector3(2, 0, 2)

// Animation variables
let time = 0

// Main game loop
while (true) {
    const shouldClose = rl.windowShouldClose()
    if (shouldClose.isErr() || shouldClose.unwrap()) break

    const frameTime = rl.getFrameTime().unwrapOr(0.016)
    time += frameTime

    // Animate ray direction - rotate around Y axis
    const angle = time * 0.5
    const animatedRayDirection = new Vector3(
        Math.sin(angle),
        0.2,
        Math.cos(angle)
    ).normalize()

    // Begin drawing
    rl.beginDrawing()
    rl.clearBackground(Colors.RAYWHITE)

    // Begin 3D mode
    rl.beginMode3D(cameraPosition, cameraTarget, cameraUp, fovy, projection)

    // Draw grid
    rl.drawGrid(10, 1.0)

    // Check ray collision with sphere
    const sphereCollision = rl.getRayCollisionSphere(rayPosition, animatedRayDirection, sphereCenter, sphereRadius)
    const sphereHit = sphereCollision.unwrapOr({ hit: false, distance: 0, point: { x: 0, y: 0, z: 0 }, normal: { x: 0, y: 0, z: 0 } })
    const sphereColor = sphereHit.hit ? Colors.RED : Colors.BLUE
    rl.drawSphere(sphereCenter, sphereRadius, sphereColor)

    // Check ray collision with box
    const boxCollision = rl.getRayCollisionBox(rayPosition, animatedRayDirection, box)
    const boxHit = boxCollision.unwrapOr({ hit: false, distance: 0, point: { x: 0, y: 0, z: 0 }, normal: { x: 0, y: 0, z: 0 } })
    const boxColor = boxHit.hit ? Colors.RED : Colors.GREEN

    // Draw box
    const boxSize = new Vector3(
        box.max.x - box.min.x,
        box.max.y - box.min.y,
        box.max.z - box.min.z
    )
    const boxCenter = new Vector3(
        (box.min.x + box.max.x) / 2,
        (box.min.y + box.max.y) / 2,
        (box.min.z + box.max.z) / 2
    )
    rl.drawCube(boxCenter, boxSize.x, boxSize.y, boxSize.z, boxColor)

    // Check ray collision with triangle
    const triangleCollision = rl.getRayCollisionTriangle(rayPosition, animatedRayDirection, triangleP1, triangleP2, triangleP3)
    const triangleHit = triangleCollision.unwrapOr({ hit: false, distance: 0, point: { x: 0, y: 0, z: 0 }, normal: { x: 0, y: 0, z: 0 } })
    const triangleColor = triangleHit.hit ? Colors.RED : Colors.YELLOW
    rl.drawTriangle3D(triangleP1, triangleP2, triangleP3, triangleColor)

    // Draw ray - make it longer and more visible
    const rayEnd = rayPosition.add(animatedRayDirection.scale(15))
    rl.drawLine3D(rayPosition, rayEnd, Colors.MAGENTA)
    
    // Draw ray origin point
    rl.drawSphere(rayPosition, 0.15, Colors.MAGENTA)

    // Draw collision points
    if (sphereHit.hit) {
        const hitPoint = new Vector3(sphereHit.point.x, sphereHit.point.y, sphereHit.point.z)
        rl.drawSphere(hitPoint, 0.1, Colors.ORANGE)
        
        // Draw normal
        const normalEnd = hitPoint.add(new Vector3(sphereHit.normal.x, sphereHit.normal.y, sphereHit.normal.z).scale(0.5))
        rl.drawLine3D(hitPoint, normalEnd, Colors.LIME)
    }

    if (boxHit.hit) {
        const hitPoint = new Vector3(boxHit.point.x, boxHit.point.y, boxHit.point.z)
        rl.drawSphere(hitPoint, 0.1, Colors.ORANGE)
        
        // Draw normal
        const normalEnd = hitPoint.add(new Vector3(boxHit.normal.x, boxHit.normal.y, boxHit.normal.z).scale(0.5))
        rl.drawLine3D(hitPoint, normalEnd, Colors.LIME)
    }

    if (triangleHit.hit) {
        const hitPoint = new Vector3(triangleHit.point.x, triangleHit.point.y, triangleHit.point.z)
        rl.drawSphere(hitPoint, 0.1, Colors.ORANGE)
        
        // Draw normal
        const normalEnd = hitPoint.add(new Vector3(triangleHit.normal.x, triangleHit.normal.y, triangleHit.normal.z).scale(0.5))
        rl.drawLine3D(hitPoint, normalEnd, Colors.LIME)
    }

    // End 3D mode
    rl.endMode3D()

    // Draw UI information
    rl.drawText("Ray Collision Detection Demo", 10, 10, 20, Colors.DARKGRAY)
    rl.drawText("Ray rotates around Y axis", 10, 40, 16, Colors.DARKGRAY)

    let yOffset = 70
    rl.drawText(`Ray-Sphere Collision: ${sphereHit.hit ? "YES" : "NO"}`, 10, yOffset, 16, sphereHit.hit ? Colors.RED : Colors.DARKGRAY)
    if (sphereHit.hit) {
        yOffset += 20
        rl.drawText(`  Distance: ${sphereHit.distance.toFixed(2)}`, 10, yOffset, 14, Colors.DARKGRAY)
    }
    
    yOffset += 25
    rl.drawText(`Ray-Box Collision: ${boxHit.hit ? "YES" : "NO"}`, 10, yOffset, 16, boxHit.hit ? Colors.RED : Colors.DARKGRAY)
    if (boxHit.hit) {
        yOffset += 20
        rl.drawText(`  Distance: ${boxHit.distance.toFixed(2)}`, 10, yOffset, 14, Colors.DARKGRAY)
    }
    
    yOffset += 25
    rl.drawText(`Ray-Triangle Collision: ${triangleHit.hit ? "YES" : "NO"}`, 10, yOffset, 16, triangleHit.hit ? Colors.RED : Colors.DARKGRAY)
    if (triangleHit.hit) {
        yOffset += 20
        rl.drawText(`  Distance: ${triangleHit.distance.toFixed(2)}`, 10, yOffset, 14, Colors.DARKGRAY)
    }

    // Draw collision count
    const totalCollisions = [sphereHit.hit, boxHit.hit, triangleHit.hit].filter(Boolean).length
    yOffset += 40
    rl.drawText(`Total Ray Hits: ${totalCollisions}`, 10, yOffset, 18, Colors.PURPLE)

    // Draw legend
    yOffset += 40
    rl.drawText("Legend:", 10, yOffset, 16, Colors.DARKGRAY)
    yOffset += 25
    rl.drawText("Magenta Line = Ray", 10, yOffset, 14, Colors.MAGENTA)
    yOffset += 20
    rl.drawText("Orange Sphere = Hit Point", 10, yOffset, 14, Colors.ORANGE)
    yOffset += 20
    rl.drawText("Green Line = Surface Normal", 10, yOffset, 14, Colors.LIME)

    rl.drawFPS(10, rl.height - 30)
    rl.endDrawing()
}

// Cleanup
rl.closeWindow()
console.log("Ray Collision Detection demo completed!")
