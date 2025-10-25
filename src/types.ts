import type { Result } from "./result"

// Rust-style error types
export enum RaylibErrorKind {
    InitError = 'INIT_ERROR',
    FFIError = 'FFI_ERROR',
    ValidationError = 'VALIDATION_ERROR',
    StateError = 'STATE_ERROR',
    DrawError = 'DRAW_ERROR',
    InputError = 'INPUT_ERROR'
}

export interface RaylibError {
    kind: RaylibErrorKind
    message: string
    context?: string
    source?: Error
}

// Helper functions для создания ошибок
export const createError = (
    kind: RaylibErrorKind,
    message: string,
    context?: string,
    source?: Error
): RaylibError => ({
    kind,
    message,
    context,
    source
})

export const initError = (message: string, context?: string): RaylibError =>
    createError(RaylibErrorKind.InitError, message, context)

export const ffiError = (message: string, source?: Error): RaylibError =>
    createError(RaylibErrorKind.FFIError, message, undefined, source)

export const validationError = (message: string, context?: string): RaylibError =>
    createError(RaylibErrorKind.ValidationError, message, context)

export const stateError = (message: string): RaylibError =>
    createError(RaylibErrorKind.StateError, message)

export const drawError = (message: string, context?: string): RaylibError =>
    createError(RaylibErrorKind.DrawError, message, context)

// Texture2D structure matching Raylib's Texture2D
export interface Texture2D {
    id: number      // OpenGL texture id
    width: number   // Texture base width
    height: number  // Texture base height
    mipmaps: number // Mipmap levels, 1 by default
    format: number  // Data format (PixelFormat type)
}

// RenderTexture2D structure matching Raylib's RenderTexture2D
export interface RenderTexture2D {
    id: number          // OpenGL framebuffer object id
    texture: Texture2D  // Color buffer attachment texture
    depth: Texture2D    // Depth buffer attachment texture
}

// Model structure using slot-based approach (like textures)
export interface Model {
    slotIndex: number      // Index in the model wrapper's slot array
    meshCount: number      // Number of meshes in the model
    materialCount: number  // Number of materials in the model
}

// BoundingBox structure matching Raylib's BoundingBox
export interface BoundingBox {
    min: { x: number; y: number; z: number }  // Minimum vertex box-corner
    max: { x: number; y: number; z: number }  // Maximum vertex box-corner
}

// Ray structure matching Raylib's Ray
export interface Ray {
    position: { x: number; y: number; z: number }  // Ray position (origin)
    direction: { x: number; y: number; z: number } // Ray direction
}

// RayCollision structure matching Raylib's RayCollision
export interface RayCollision {
    hit: boolean                                   // Did the ray hit something?
    distance: number                               // Distance to nearest hit
    point: { x: number; y: number; z: number }     // Point of nearest hit
    normal: { x: number; y: number; z: number }    // Surface normal of hit
}

// Mesh structure (simplified for collision detection)
export interface Mesh {
    slotIndex: number      // Index in the mesh wrapper's slot array
    vertexCount: number    // Number of vertices stored in arrays
    triangleCount: number  // Number of triangles stored (indexed or not)
}

// Matrix structure matching Raylib's Matrix (4x4 matrix)
export interface Matrix {
    m0: number; m4: number; m8: number; m12: number  // Matrix first row (4 components)
    m1: number; m5: number; m9: number; m13: number  // Matrix second row (4 components)
    m2: number; m6: number; m10: number; m14: number  // Matrix third row (4 components)
    m3: number; m7: number; m11: number; m15: number  // Matrix fourth row (4 components)
}

// Shader structure using slot-based approach
export interface Shader {
    slotIndex: number  // Index in the shader wrapper's slot array
}

// BlendMode enum matching Raylib's BlendMode constants
export enum BlendMode {
    ALPHA = 0,              // Blend textures considering alpha (default)
    ADDITIVE = 1,           // Blend textures adding colors
    MULTIPLIED = 2,         // Blend textures multiplying colors
    ADD_COLORS = 3,         // Blend textures adding colors (alternative)
    SUBTRACT_COLORS = 4,    // Blend textures subtracting colors
    ALPHA_PREMULTIPLY = 5,  // Blend premultiplied textures
    CUSTOM = 6,             // Blend textures using custom src/dst factors
    CUSTOM_SEPARATE = 7     // Blend textures using custom rgb/alpha factors
}

// Font structure using slot-based approach
export interface Font {
    slotIndex: number      // Index in the font wrapper's slot array
    baseSize: number       // Base size (default chars height)
    glyphCount: number     // Number of glyphs in the font
}

// Text measurement result
export interface TextMeasurement {
    width: number          // Text width in pixels
    height: number         // Text height in pixels
}

// Text alignment enum
export enum TextAlignment {
    LEFT = 0,
    CENTER = 1,
    RIGHT = 2
}

// Text formatting options
export interface TextFormatOptions {
    fontSize?: number
    spacing?: number
    lineSpacing?: number
    alignment?: TextAlignment
    maxWidth?: number
    wordWrap?: boolean
}

// Type aliases для Result types
export type RaylibResult<T> = Result<T, RaylibError>