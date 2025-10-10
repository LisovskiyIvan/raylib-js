export interface Vector2 {
    x: number,
    y: number
}

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

// Type aliases для Result types
export type RaylibResult<T> = import('./result').Result<T, RaylibError>