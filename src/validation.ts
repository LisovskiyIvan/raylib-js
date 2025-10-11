import { validationError, type RaylibResult } from "./types"
import { Err, Ok } from "./result"
// Validation helpers that return void on success
export const validatePositive = (value: number, name: string): RaylibResult<void> => {
    if (value <= 0) {
        return new Err(validationError(`${name} must be positive`, `got ${value}`))
    }
    return new Ok(undefined)
}

export const validateNonNegative = (value: number, name: string): RaylibResult<void> => {
    if (value < 0) {
        return new Err(validationError(`${name} cannot be negative`, `got ${value}`))
    }
    return new Ok(undefined)
}

export const validateFinite = (value: number, name: string): RaylibResult<void> => {
    if (!isFinite(value) || isNaN(value)) {
        return new Err(validationError(`${name} must be finite`, `got ${value}`))
    }
    return new Ok(undefined)
}

export const validateColor = (value: number, name: string): RaylibResult<void> => {
    if (typeof value !== 'number' || isNaN(value) || value < 0 || value > 0xFFFFFFFF) {
        return new Err(validationError(`${name} must be a valid color (0x00000000 - 0xFFFFFFFF)`, `got ${value}`))
    }
    return new Ok(undefined)
}

export const validateNonEmptyString = (value: string, name: string): RaylibResult<void> => {
    if (typeof value !== 'string' || value.trim().length === 0) {
        return new Err(validationError(`${name} must be a non-empty string`, `got ${value}`))
    }
    return new Ok(undefined)
}

export const validateRange = (value: number, min: number, max: number, name: string): RaylibResult<void> => {
    if (value < min || value > max) {
        return new Err(validationError(`${name} must be between ${min} and ${max}`, `got ${value}`))
    }
    return new Ok(undefined)
}

// Utility function для комбинирования валидаций
export const validateAll = (...validations: RaylibResult<void>[]): RaylibResult<void> => {
    for (const validation of validations) {
        if (validation.isErr()) {
            return validation
        }
    }
    return new Ok(undefined)
}
