// Example 14: Shader Demo - Custom Shaders, Blend Modes, and Scissor Mode
import { Raylib, Colors, Vector2, Vector3, BlendMode } from '../src/index'

const rl = new Raylib()

// Initialize window
const initResult = rl.initWindow(1200, 800, "Raylib - Shader Demo")
if (initResult.isErr()) {
    console.error("Initialization error:", initResult.error)
    process.exit(1)
}

rl.setTargetFPS(60)

// Simple vertex shader (passthrough)
const vertexShader = `
#version 330
in vec3 vertexPosition;
in vec2 vertexTexCoord;
in vec4 vertexColor;

uniform mat4 mvp;

out vec2 fragTexCoord;
out vec4 fragColor;

void main()
{
    fragTexCoord = vertexTexCoord;
    fragColor = vertexColor;
    gl_Position = mvp * vec4(vertexPosition, 1.0);
}
`

// Fragment shader with animated wave effect
const waveFragmentShader = `
#version 330
in vec2 fragTexCoord;
in vec4 fragColor;

uniform float time;
uniform vec2 resolution;
uniform vec3 color1;
uniform vec3 color2;

out vec4 finalColor;

void main()
{
    vec2 uv = fragTexCoord;
    
    // Create wave effect
    float wave = sin(uv.x * 10.0 + time * 2.0) * 0.5 + 0.5;
    wave *= sin(uv.y * 10.0 + time * 1.5) * 0.5 + 0.5;
    
    // Mix colors based on wave
    vec3 color = mix(color1, color2, wave);
    
    finalColor = vec4(color, 1.0) * fragColor;
}
`

// Fragment shader with radial gradient
const radialFragmentShader = `
#version 330
in vec2 fragTexCoord;
in vec4 fragColor;

uniform vec2 center;
uniform vec3 innerColor;
uniform vec3 outerColor;
uniform float radius;

out vec4 finalColor;

void main()
{
    vec2 uv = fragTexCoord;
    float dist = distance(uv, center);
    float t = smoothstep(0.0, radius, dist);
    
    vec3 color = mix(innerColor, outerColor, t);
    finalColor = vec4(color, 1.0) * fragColor;
}
`

// Fragment shader with pixelation effect
const pixelateFragmentShader = `
#version 330
in vec2 fragTexCoord;
in vec4 fragColor;

uniform float pixelSize;
uniform vec2 resolution;

out vec4 finalColor;

void main()
{
    vec2 uv = fragTexCoord;
    
    // Pixelate effect
    vec2 pixelated = floor(uv * resolution / pixelSize) * pixelSize / resolution;
    
    // Create checkerboard pattern
    float checker = mod(floor(pixelated.x * 20.0) + floor(pixelated.y * 20.0), 2.0);
    vec3 color = mix(vec3(0.2, 0.3, 0.8), vec3(0.8, 0.3, 0.2), checker);
    
    finalColor = vec4(color, 1.0) * fragColor;
}
`

// Load shaders
console.log("Loading shaders...")
const waveShaderResult = rl.loadShaderFromMemory(vertexShader, waveFragmentShader)
const radialShaderResult = rl.loadShaderFromMemory(vertexShader, radialFragmentShader)
const pixelateShaderResult = rl.loadShaderFromMemory(vertexShader, pixelateFragmentShader)

if (waveShaderResult.isErr() || radialShaderResult.isErr() || pixelateShaderResult.isErr()) {
    console.error("Failed to load shaders")
    rl.closeWindow()
    process.exit(1)
}

const waveShader = waveShaderResult.unwrap()
const radialShader = radialShaderResult.unwrap()
const pixelateShader = pixelateShaderResult.unwrap()

console.log(`Loaded ${rl.getLoadedShaderCount().unwrap()} shaders`)

// Get uniform locations for wave shader
const waveTimeLoc = rl.getShaderLocation(waveShader, "time").unwrap()
const waveResolutionLoc = rl.getShaderLocation(waveShader, "resolution").unwrap()
const waveColor1Loc = rl.getShaderLocation(waveShader, "color1").unwrap()
const waveColor2Loc = rl.getShaderLocation(waveShader, "color2").unwrap()

// Get uniform locations for radial shader
const radialCenterLoc = rl.getShaderLocation(radialShader, "center").unwrap()
const radialInnerColorLoc = rl.getShaderLocation(radialShader, "innerColor").unwrap()
const radialOuterColorLoc = rl.getShaderLocation(radialShader, "outerColor").unwrap()
const radialRadiusLoc = rl.getShaderLocation(radialShader, "radius").unwrap()

// Get uniform locations for pixelate shader
const pixelSizeLoc = rl.getShaderLocation(pixelateShader, "pixelSize").unwrap()
const pixelResolutionLoc = rl.getShaderLocation(pixelateShader, "resolution").unwrap()

console.log("Shader uniforms located successfully")

// Game variables
let time = 0
let currentShader = 0
const shaderNames = ["Wave Effect", "Radial Gradient", "Pixelate Effect", "No Shader"]
let currentBlendMode = 0
const blendModeNames = ["Alpha", "Additive", "Multiplied", "Add Colors", "Subtract Colors"]
const blendModes = [BlendMode.ALPHA, BlendMode.ADDITIVE, BlendMode.MULTIPLIED, BlendMode.ADD_COLORS, BlendMode.SUBTRACT_COLORS]
let showScissor = false

// Main game loop
console.log("Starting main loop...")
while (true) {
    const shouldClose = rl.windowShouldClose().unwrap()
    if (shouldClose) break

    const deltaTime = rl.getFrameTime().unwrap()
    time += deltaTime

    // Input handling
    const keyPressed = rl.getKeyPressed().unwrap()
    if (keyPressed === 83) { // S key - switch shader
        currentShader = (currentShader + 1) % 4
        console.log(`Switched to: ${shaderNames[currentShader]}`)
    }
    if (keyPressed === 66) { // B key - switch blend mode
        currentBlendMode = (currentBlendMode + 1) % blendModes.length
        console.log(`Blend mode: ${blendModeNames[currentBlendMode]}`)
    }
    if (keyPressed === 67) { // C key - toggle scissor mode
        showScissor = !showScissor
        console.log(`Scissor mode: ${showScissor ? 'ON' : 'OFF'}`)
    }

    // Update shader uniforms
    if (currentShader === 0) {
        // Wave shader uniforms
        rl.setShaderValueFloat(waveShader, waveTimeLoc, time).unwrap()
        rl.setShaderValueVec2(waveShader, waveResolutionLoc, new Vector2(1200, 800)).unwrap()
        rl.setShaderValueVec3(waveShader, waveColor1Loc, new Vector3(0.2, 0.5, 1.0)).unwrap()
        rl.setShaderValueVec3(waveShader, waveColor2Loc, new Vector3(1.0, 0.3, 0.5)).unwrap()
    } else if (currentShader === 1) {
        // Radial shader uniforms
        const centerX = 0.5 + Math.sin(time) * 0.2
        const centerY = 0.5 + Math.cos(time * 0.7) * 0.2
        rl.setShaderValueVec2(radialShader, radialCenterLoc, new Vector2(centerX, centerY)).unwrap()
        rl.setShaderValueVec3(radialShader, radialInnerColorLoc, new Vector3(1.0, 1.0, 0.2)).unwrap()
        rl.setShaderValueVec3(radialShader, radialOuterColorLoc, new Vector3(0.2, 0.2, 0.8)).unwrap()
        rl.setShaderValueFloat(radialShader, radialRadiusLoc, 0.8).unwrap()
    } else if (currentShader === 2) {
        // Pixelate shader uniforms
        const pixelSize = 5.0 + Math.sin(time) * 3.0
        rl.setShaderValueFloat(pixelateShader, pixelSizeLoc, pixelSize).unwrap()
        rl.setShaderValueVec2(pixelateShader, pixelResolutionLoc, new Vector2(1200, 800)).unwrap()
    }

    // Drawing
    rl.beginDrawing()
    rl.clearBackground(Colors.RAYWHITE)

    // Draw title
    rl.drawText("Shader Demo", 20, 20, 32, Colors.BLACK)

    // Draw instructions
    rl.drawText("S - Switch Shader", 20, 60, 16, Colors.DARKGRAY)
    rl.drawText("B - Switch Blend Mode", 20, 80, 16, Colors.DARKGRAY)
    rl.drawText("C - Toggle Scissor Mode", 20, 100, 16, Colors.DARKGRAY)
    rl.drawText("ESC - Exit", 20, 120, 16, Colors.DARKGRAY)

    // Draw current mode info
    rl.drawText(`Current Shader: ${shaderNames[currentShader]}`, 20, 160, 20, Colors.BLUE)
    rl.drawText(`Blend Mode: ${blendModeNames[currentBlendMode]}`, 20, 190, 20, Colors.GREEN)
    rl.drawText(`Scissor Mode: ${showScissor ? 'ON' : 'OFF'}`, 20, 220, 20, Colors.PURPLE)

    // Main shader demonstration area
    const demoX = 400
    const demoY = 100
    const demoWidth = 700
    const demoHeight = 600

    // Draw border
    rl.drawRectangle(demoX - 2, demoY - 2, demoWidth + 4, demoHeight + 4, Colors.BLACK)

    // Apply scissor mode if enabled
    if (showScissor) {
        const scissorMargin = 50
        rl.beginScissorMode(
            demoX + scissorMargin,
            demoY + scissorMargin,
            demoWidth - scissorMargin * 2,
            demoHeight - scissorMargin * 2
        ).unwrap()
    }

    // Apply blend mode
    rl.beginBlendMode(blendModes[currentBlendMode]!).unwrap()

    // Apply shader and draw rectangles
    if (currentShader < 3) {
        const shader = currentShader === 0 ? waveShader : currentShader === 1 ? radialShader : pixelateShader
        rl.beginShaderMode(shader).unwrap()
    }

    // Draw main shader area
    rl.drawRectangle(demoX, demoY, demoWidth, demoHeight, Colors.WHITE)

    // Draw some shapes with the shader applied
    const centerX = demoX + demoWidth / 2
    const centerY = demoY + demoHeight / 2

    // Animated circles
    for (let i = 0; i < 5; i++) {
        const angle = time + (i * Math.PI * 2 / 5)
        const radius = 150 + Math.sin(time + i) * 50
        const x = centerX + Math.cos(angle) * radius
        const y = centerY + Math.sin(angle) * radius
        rl.drawCircle(x, y, 40, Colors.WHITE)
    }

    // Central rotating rectangle
    const rectSize = 100 + Math.sin(time * 2) * 20
    rl.drawRectangle(
        centerX - rectSize / 2,
        centerY - rectSize / 2,
        rectSize,
        rectSize,
        Colors.WHITE
    )

    if (currentShader < 3) {
        rl.endShaderMode().unwrap()
    }

    rl.endBlendMode().unwrap()

    if (showScissor) {
        rl.endScissorMode().unwrap()
        // Draw scissor border indicator
        const scissorMargin = 50
        rl.drawRectangle(demoX + scissorMargin - 2, demoY + scissorMargin - 2, demoWidth - scissorMargin * 2 + 4, 2, Colors.RED)
        rl.drawRectangle(demoX + scissorMargin - 2, demoY + demoHeight - scissorMargin, demoWidth - scissorMargin * 2 + 4, 2, Colors.RED)
        rl.drawRectangle(demoX + scissorMargin - 2, demoY + scissorMargin, 2, demoHeight - scissorMargin * 2, Colors.RED)
        rl.drawRectangle(demoX + demoWidth - scissorMargin, demoY + scissorMargin, 2, demoHeight - scissorMargin * 2, Colors.RED)
    }

    // Blend mode demonstration (bottom left)
    rl.drawText("Blend Mode Demo:", 20, 500, 16, Colors.BLACK)

    rl.beginBlendMode(blendModes[currentBlendMode]!).unwrap()

    // Overlapping circles to show blend effect
    rl.drawCircle(100, 600, 50, Colors.RED)
    rl.drawCircle(150, 600, 50, Colors.GREEN)
    rl.drawCircle(125, 650, 50, Colors.BLUE)

    rl.endBlendMode().unwrap()

    rl.drawFPS(10, 750)
    rl.endDrawing()
}

// Cleanup
console.log("Cleaning up...")
rl.unloadAllShaders().unwrap()
console.log("Shaders unloaded")
rl.closeWindow()
console.log("Window closed")
