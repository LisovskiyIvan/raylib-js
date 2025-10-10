import { Result, Ok, Err, ok, err } from './result'
import type { RaylibError } from './types'
import { RaylibErrorKind } from './types'

// Utility для работы с массивами Results
export function collectResults<T>(results: Result<T, RaylibError>[]): Result<T[], RaylibError> {
    const values: T[] = []

    for (const result of results) {
        if (result.isErr()) {
            return err(result.error)
        }
        if (result.isOk()) {
            values.push(result.value)
        }
    }

    return ok(values)
}

// Выполнить операции последовательно, остановиться на первой ошибке
export function sequence<T>(operations: (() => Result<T, RaylibError>)[]): Result<T[], RaylibError> {
    const results: T[] = []

    for (const operation of operations) {
        const result = operation()
        if (result.isErr()) {
            return err(result.error)
        }
        if (result.isOk()) {
            results.push(result.value)
        }
    }

    return ok(results)
}

// Retry операцию с экспоненциальным backoff
export function retry<T>(
    operation: () => Result<T, RaylibError>,
    maxAttempts: number = 3,
    baseDelay: number = 100
): Result<T, RaylibError> {
    let lastError: RaylibError | null = null

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const result = operation()

        if (result.isOk()) {
            return result
        }

        if (result.isErr()) {
            lastError = result.error

            // Don't retry on certain error types
            if (result.error.kind === 'VALIDATION_ERROR' || result.error.kind === 'INIT_ERROR') {
                return result
            }
        }

        // Wait before retry (except on last attempt)
        if (attempt < maxAttempts - 1) {
            const delay = baseDelay * Math.pow(2, attempt)
            // In a real app, you'd use setTimeout or similar
            // For now, just continue immediately
        }
    }

    return err(lastError!)
}

// Timeout wrapper для операций
export function withTimeout<T>(
    operation: () => Result<T, RaylibError>,
    timeoutMs: number
): Result<T, RaylibError> {
    // В реальном приложении здесь была бы асинхронная логика
    // Для демонстрации просто выполняем операцию
    return operation()
}

// Логирование результатов
export function logResult<T>(
    result: Result<T, RaylibError>,
    operation: string
): Result<T, RaylibError> {
    return result.match(
        (value) => {
            console.log(`✅ ${operation} succeeded`)
            return ok(value)
        },
        (error) => {
            console.error(`❌ ${operation} failed: [${error.kind}] ${error.message}`)
            if (error.context) {
                console.error(`   Context: ${error.context}`)
            }
            return err(error)
        }
    )
}

// Преобразование Result в Promise (для интеграции с async/await)
export function resultToPromise<T>(result: Result<T, RaylibError>): Promise<T> {
    return result.match(
        (value) => Promise.resolve(value),
        (error) => Promise.reject(new Error(`[${error.kind}] ${error.message}`))
    )
}

// Преобразование Promise в Result
export async function promiseToResult<T>(promise: Promise<T>): Promise<Result<T, RaylibError>> {
    try {
        const value = await promise
        return ok(value)
    } catch (error) {
        return err({
            kind: RaylibErrorKind.FFIError,
            message: error instanceof Error ? error.message : String(error),
            source: error instanceof Error ? error : undefined
        })
    }
}

// Batch операции с ограничением на количество ошибок
export function batchWithErrorLimit<T>(
    operations: (() => Result<T, RaylibError>)[],
    maxErrors: number = 1
): Result<T[], RaylibError[]> {
    const results: T[] = []
    const errors: RaylibError[] = []

    for (const operation of operations) {
        const result = operation()

        if (result.isOk()) {
            results.push(result.value)
        } else if (result.isErr()) {
            errors.push(result.error)

            if (errors.length >= maxErrors) {
                return err(errors)
            }
        }
    }

    return errors.length > 0 ? err(errors) : ok(results)
}

// Создание Result из nullable значения
export function fromNullable<T>(
    value: T | null | undefined,
    error: RaylibError
): Result<T, RaylibError> {
    return value != null ? ok(value) : err(error)
}

// Создание Result из boolean условия
export function fromCondition(
    condition: boolean,
    value: () => any,
    error: RaylibError
): Result<any, RaylibError> {
    return condition ? ok(value()) : err(error)
}