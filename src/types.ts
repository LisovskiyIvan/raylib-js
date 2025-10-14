
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

// Type aliases для Result types
export type RaylibResult<T> = import('./result').Result<T, RaylibError>