import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import Raylib from '../src/Raylib'
import { RaylibErrorKind, BlendMode } from '../src/types'
import Vector2 from '../src/math/Vector2'
import Vector3 from '../src/math/Vector3'
import { Colors } from '../src/constants'

describe('Shader Loading', () => {
    let rl: Raylib

    beforeEach(() => {
        rl = new Raylib()
        const initResult = rl.initWindow(800, 600, 'Shader Test')
        expect(initResult.isOk()).toBe(true)
    })

    afterEach(() => {
        rl.unloadAllShaders()
        rl.closeWindow()
    })

    test('should load shader from memory successfully', () => {
        const vertexShader = `
#version 330
in vec3 vertexPosition;
in vec2 vertexTexCoord;
in vec4 vertexColor;
uniform mat4 mvp;
out vec2 fragTexCoord;
out vec4 fragColor;
void main() {
    fragTexCoord = vertexTexCoord;
    fragColor = vertexColor;
    gl_Position = mvp * vec4(vertexPosition, 1.0);
}
`
        const fragmentShader = `
#version 330
in vec2 fragTexCoord;
in vec4 fragColor;
out vec4 finalColor;
void main() {
    finalColor = fragColor;
}
`

        const result = rl.loadShaderFromMemory(vertexShader, fragmentShader)
        expect(result.isOk()).toBe(true)

        if (result.isOk()) {
            const shader = result.unwrap()
            expect(shader.slotIndex).toBeGreaterThanOrEqual(0)
        }
    })

    test('should validate shader successfully', () => {
        const vertexShader = `
#version 330
in vec3 vertexPosition;
uniform mat4 mvp;
void main() {
    gl_Position = mvp * vec4(vertexPosition, 1.0);
}
`
        const fragmentShader = `
#version 330
out vec4 finalColor;
void main() {
    finalColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`

        const loadResult = rl.loadShaderFromMemory(vertexShader, fragmentShader)
        expect(loadResult.isOk()).toBe(true)

        if (loadResult.isOk()) {
            const shader = loadResult.unwrap()
            const validResult = rl.isShaderValid(shader)
            expect(validResult.isOk()).toBe(true)
            expect(validResult.unwrap()).toBe(true)
        }
    })

    test('should track loaded shader count', () => {
        const vertexShader = `
#version 330
in vec3 vertexPosition;
uniform mat4 mvp;
void main() {
    gl_Position = mvp * vec4(vertexPosition, 1.0);
}
`
        const fragmentShader = `
#version 330
out vec4 finalColor;
void main() {
    finalColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`

        const initialCount = rl.getLoadedShaderCount().unwrap()

        const shader1 = rl.loadShaderFromMemory(vertexShader, fragmentShader).unwrap()
        expect(rl.getLoadedShaderCount().unwrap()).toBe(initialCount + 1)

        const shader2 = rl.loadShaderFromMemory(vertexShader, fragmentShader).unwrap()
        expect(rl.getLoadedShaderCount().unwrap()).toBe(initialCount + 2)

        rl.unloadShader(shader1)
        expect(rl.getLoadedShaderCount().unwrap()).toBe(initialCount + 1)

        rl.unloadShader(shader2)
        expect(rl.getLoadedShaderCount().unwrap()).toBe(initialCount)
    })

    test('should unload all shaders', () => {
        const vertexShader = `
#version 330
in vec3 vertexPosition;
uniform mat4 mvp;
void main() {
    gl_Position = mvp * vec4(vertexPosition, 1.0);
}
`
        const fragmentShader = `
#version 330
out vec4 finalColor;
void main() {
    finalColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`

        rl.loadShaderFromMemory(vertexShader, fragmentShader).unwrap()
        rl.loadShaderFromMemory(vertexShader, fragmentShader).unwrap()
        rl.loadShaderFromMemory(vertexShader, fragmentShader).unwrap()

        expect(rl.getLoadedShaderCount().unwrap()).toBeGreaterThanOrEqual(3)

        const unloadResult = rl.unloadAllShaders()
        expect(unloadResult.isOk()).toBe(true)
        expect(rl.getLoadedShaderCount().unwrap()).toBe(0)
    })
})

describe('Shader Mode', () => {
    let rl: Raylib

    beforeEach(() => {
        rl = new Raylib()
        const initResult = rl.initWindow(800, 600, 'Shader Mode Test')
        expect(initResult.isOk()).toBe(true)
    })

    afterEach(() => {
        rl.unloadAllShaders()
        rl.closeWindow()
    })

    test('should begin and end shader mode', () => {
        const vertexShader = `
#version 330
in vec3 vertexPosition;
in vec2 vertexTexCoord;
in vec4 vertexColor;
uniform mat4 mvp;
out vec2 fragTexCoord;
out vec4 fragColor;
void main() {
    fragTexCoord = vertexTexCoord;
    fragColor = vertexColor;
    gl_Position = mvp * vec4(vertexPosition, 1.0);
}
`
        const fragmentShader = `
#version 330
in vec2 fragTexCoord;
in vec4 fragColor;
out vec4 finalColor;
void main() {
    finalColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`

        const shader = rl.loadShaderFromMemory(vertexShader, fragmentShader).unwrap()

        const beginResult = rl.beginShaderMode(shader)
        expect(beginResult.isOk()).toBe(true)

        const endResult = rl.endShaderMode()
        expect(endResult.isOk()).toBe(true)
    })

    test('should fail to begin shader mode with negative shader slot', () => {
        const invalidShader = { slotIndex: -1 }

        const result = rl.beginShaderMode(invalidShader)
        expect(result.isErr()).toBe(true)

        if (result.isErr()) {
            expect(result.error.kind).toBe(RaylibErrorKind.ValidationError)
        }
    })

    test('should require initialization for shader mode', () => {
        const rl2 = new Raylib()
        const shader = { slotIndex: 0 }

        const result = rl2.beginShaderMode(shader)
        expect(result.isErr()).toBe(true)

        if (result.isErr()) {
            expect(result.error.kind).toBe(RaylibErrorKind.StateError)
            expect(result.error.message).toContain('Window must be initialized')
        }
    })
})

describe('Shader Uniforms', () => {
    let rl: Raylib

    beforeEach(() => {
        rl = new Raylib()
        const initResult = rl.initWindow(800, 600, 'Shader Uniforms Test')
        expect(initResult.isOk()).toBe(true)
    })

    afterEach(() => {
        rl.unloadAllShaders()
        rl.closeWindow()
    })

    test('should get shader location for uniform', () => {
        const vertexShader = `
#version 330
in vec3 vertexPosition;
uniform mat4 mvp;
void main() {
    gl_Position = mvp * vec4(vertexPosition, 1.0);
}
`
        const fragmentShader = `
#version 330
uniform float time;
out vec4 finalColor;
void main() {
    finalColor = vec4(sin(time), 0.0, 0.0, 1.0);
}
`

        const shader = rl.loadShaderFromMemory(vertexShader, fragmentShader).unwrap()
        const locResult = rl.getShaderLocation(shader, 'time')

        expect(locResult.isOk()).toBe(true)
        if (locResult.isOk()) {
            expect(locResult.unwrap()).toBeGreaterThanOrEqual(-1)
        }
    })

    test('should set float uniform value', () => {
        const vertexShader = `
#version 330
in vec3 vertexPosition;
uniform mat4 mvp;
void main() {
    gl_Position = mvp * vec4(vertexPosition, 1.0);
}
`
        const fragmentShader = `
#version 330
uniform float intensity;
out vec4 finalColor;
void main() {
    finalColor = vec4(intensity, 0.0, 0.0, 1.0);
}
`

        const shader = rl.loadShaderFromMemory(vertexShader, fragmentShader).unwrap()
        const loc = rl.getShaderLocation(shader, 'intensity').unwrap()

        const result = rl.setShaderValueFloat(shader, loc, 0.5)
        expect(result.isOk()).toBe(true)
    })

    test('should set int uniform value', () => {
        const vertexShader = `
#version 330
in vec3 vertexPosition;
uniform mat4 mvp;
void main() {
    gl_Position = mvp * vec4(vertexPosition, 1.0);
}
`
        const fragmentShader = `
#version 330
uniform int mode;
out vec4 finalColor;
void main() {
    finalColor = vec4(float(mode) / 10.0, 0.0, 0.0, 1.0);
}
`

        const shader = rl.loadShaderFromMemory(vertexShader, fragmentShader).unwrap()
        const loc = rl.getShaderLocation(shader, 'mode').unwrap()

        const result = rl.setShaderValueInt(shader, loc, 5)
        expect(result.isOk()).toBe(true)
    })

    test('should set vec2 uniform value', () => {
        const vertexShader = `
#version 330
in vec3 vertexPosition;
uniform mat4 mvp;
void main() {
    gl_Position = mvp * vec4(vertexPosition, 1.0);
}
`
        const fragmentShader = `
#version 330
uniform vec2 resolution;
out vec4 finalColor;
void main() {
    finalColor = vec4(resolution.x / 1000.0, resolution.y / 1000.0, 0.0, 1.0);
}
`

        const shader = rl.loadShaderFromMemory(vertexShader, fragmentShader).unwrap()
        const loc = rl.getShaderLocation(shader, 'resolution').unwrap()

        const result = rl.setShaderValueVec2(shader, loc, new Vector2(800, 600))
        expect(result.isOk()).toBe(true)
    })

    test('should set vec3 uniform value', () => {
        const vertexShader = `
#version 330
in vec3 vertexPosition;
uniform mat4 mvp;
void main() {
    gl_Position = mvp * vec4(vertexPosition, 1.0);
}
`
        const fragmentShader = `
#version 330
uniform vec3 color;
out vec4 finalColor;
void main() {
    finalColor = vec4(color, 1.0);
}
`

        const shader = rl.loadShaderFromMemory(vertexShader, fragmentShader).unwrap()
        const loc = rl.getShaderLocation(shader, 'color').unwrap()

        const result = rl.setShaderValueVec3(shader, loc, new Vector3(1.0, 0.5, 0.2))
        expect(result.isOk()).toBe(true)
    })

    test('should set vec4 uniform value', () => {
        const vertexShader = `
#version 330
in vec3 vertexPosition;
uniform mat4 mvp;
void main() {
    gl_Position = mvp * vec4(vertexPosition, 1.0);
}
`
        const fragmentShader = `
#version 330
uniform vec4 tintColor;
out vec4 finalColor;
void main() {
    finalColor = tintColor;
}
`

        const shader = rl.loadShaderFromMemory(vertexShader, fragmentShader).unwrap()
        const loc = rl.getShaderLocation(shader, 'tintColor').unwrap()

        const result = rl.setShaderValueVec4(shader, loc, 1.0, 0.5, 0.2, 1.0)
        expect(result.isOk()).toBe(true)
    })
})

describe('Blend Modes', () => {
    let rl: Raylib

    beforeEach(() => {
        rl = new Raylib()
        const initResult = rl.initWindow(800, 600, 'Blend Mode Test')
        expect(initResult.isOk()).toBe(true)
    })

    afterEach(() => {
        rl.closeWindow()
    })

    test('should begin and end blend mode', () => {
        const beginResult = rl.beginBlendMode(BlendMode.ALPHA)
        expect(beginResult.isOk()).toBe(true)

        const endResult = rl.endBlendMode()
        expect(endResult.isOk()).toBe(true)
    })

    test('should support all blend modes', () => {
        const blendModes = [
            BlendMode.ALPHA,
            BlendMode.ADDITIVE,
            BlendMode.MULTIPLIED,
            BlendMode.ADD_COLORS,
            BlendMode.SUBTRACT_COLORS,
            BlendMode.ALPHA_PREMULTIPLY
        ]

        for (const mode of blendModes) {
            const result = rl.beginBlendMode(mode)
            expect(result.isOk()).toBe(true)
            rl.endBlendMode()
        }
    })

    test('should draw with blend mode', () => {
        rl.beginDrawing()
        rl.clearBackground(Colors.RAYWHITE)

        const blendResult = rl.beginBlendMode(BlendMode.ADDITIVE)
        expect(blendResult.isOk()).toBe(true)

        rl.drawCircle(100, 100, 50, Colors.RED)
        rl.drawCircle(150, 100, 50, Colors.GREEN)

        rl.endBlendMode()
        rl.endDrawing()
    })

    test('should require initialization for blend mode', () => {
        const rl2 = new Raylib()

        const result = rl2.beginBlendMode(BlendMode.ALPHA)
        expect(result.isErr()).toBe(true)

        if (result.isErr()) {
            expect(result.error.kind).toBe(RaylibErrorKind.StateError)
            expect(result.error.message).toContain('Window must be initialized')
        }
    })
})

describe('Scissor Mode', () => {
    let rl: Raylib

    beforeEach(() => {
        rl = new Raylib()
        const initResult = rl.initWindow(800, 600, 'Scissor Mode Test')
        expect(initResult.isOk()).toBe(true)
    })

    afterEach(() => {
        rl.closeWindow()
    })

    test('should begin and end scissor mode', () => {
        const beginResult = rl.beginScissorMode(100, 100, 200, 200)
        expect(beginResult.isOk()).toBe(true)

        const endResult = rl.endScissorMode()
        expect(endResult.isOk()).toBe(true)
    })

    test('should validate scissor dimensions', () => {
        const result1 = rl.beginScissorMode(0, 0, -100, 100)
        expect(result1.isErr()).toBe(true)

        if (result1.isErr()) {
            expect(result1.error.kind).toBe(RaylibErrorKind.ValidationError)
        }

        const result2 = rl.beginScissorMode(0, 0, 100, -100)
        expect(result2.isErr()).toBe(true)

        if (result2.isErr()) {
            expect(result2.error.kind).toBe(RaylibErrorKind.ValidationError)
        }
    })

    test('should draw with scissor mode', () => {
        rl.beginDrawing()
        rl.clearBackground(Colors.RAYWHITE)

        const scissorResult = rl.beginScissorMode(100, 100, 200, 200)
        expect(scissorResult.isOk()).toBe(true)

        rl.drawRectangle(0, 0, 800, 600, Colors.RED)

        rl.endScissorMode()
        rl.endDrawing()
    })

    test('should require initialization for scissor mode', () => {
        const rl2 = new Raylib()

        const result = rl2.beginScissorMode(0, 0, 100, 100)
        expect(result.isErr()).toBe(true)

        if (result.isErr()) {
            expect(result.error.kind).toBe(RaylibErrorKind.StateError)
            expect(result.error.message).toContain('Window must be initialized')
        }
    })
})

describe('Shader Error Handling', () => {
    let rl: Raylib

    beforeEach(() => {
        rl = new Raylib()
        const initResult = rl.initWindow(800, 600, 'Shader Error Test')
        expect(initResult.isOk()).toBe(true)
    })

    afterEach(() => {
        rl.unloadAllShaders()
        rl.closeWindow()
    })

    test('should validate empty shader code', () => {
        const result = rl.loadShaderFromMemory('', '')
        expect(result.isErr()).toBe(true)

        if (result.isErr()) {
            expect(result.error.kind).toBe(RaylibErrorKind.ValidationError)
        }
    })

    test('should validate shader slot index', () => {
        const invalidShader = { slotIndex: -1 }

        const result = rl.beginShaderMode(invalidShader)
        expect(result.isErr()).toBe(true)

        if (result.isErr()) {
            expect(result.error.kind).toBe(RaylibErrorKind.ValidationError)
        }
    })

    test('should allow setting uniform with location -1', () => {
        const vertexShader = `
#version 330
in vec3 vertexPosition;
uniform mat4 mvp;
void main() {
    gl_Position = mvp * vec4(vertexPosition, 1.0);
}
`
        const fragmentShader = `
#version 330
out vec4 finalColor;
void main() {
    finalColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`

        const shader = rl.loadShaderFromMemory(vertexShader, fragmentShader).unwrap()

        // Location -1 is valid (means uniform not found, but setting is allowed)
        const result = rl.setShaderValueFloat(shader, -1, 1.0)
        expect(result.isOk()).toBe(true)
    })

    test('should validate finite values for uniforms', () => {
        const vertexShader = `
#version 330
in vec3 vertexPosition;
uniform mat4 mvp;
void main() {
    gl_Position = mvp * vec4(vertexPosition, 1.0);
}
`
        const fragmentShader = `
#version 330
uniform float value;
out vec4 finalColor;
void main() {
    finalColor = vec4(value, 0.0, 0.0, 1.0);
}
`

        const shader = rl.loadShaderFromMemory(vertexShader, fragmentShader).unwrap()
        const loc = rl.getShaderLocation(shader, 'value').unwrap()

        const result = rl.setShaderValueFloat(shader, loc, NaN)
        expect(result.isErr()).toBe(true)

        if (result.isErr()) {
            expect(result.error.kind).toBe(RaylibErrorKind.ValidationError)
        }
    })

    test('should require initialization for shader operations', () => {
        const rl2 = new Raylib()

        const result = rl2.loadShaderFromMemory('test', 'test')
        expect(result.isErr()).toBe(true)

        if (result.isErr()) {
            expect(result.error.kind).toBe(RaylibErrorKind.StateError)
            expect(result.error.message).toContain('Window must be initialized')
        }
    })
})
