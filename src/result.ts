// Rust-style Result type для TypeScript
export abstract class Result<T, E> {
  abstract isOk(): this is Ok<T, E>
  abstract isErr(): this is Err<T, E>
  
  // Unwrap методы
  unwrap(): T {
    if (this.isOk()) {
      return this.value
    }
    if (this.isErr()) {
      throw new Error(`Called unwrap on an Err value: ${this.error}`)
    }
    throw new Error('Invalid Result state')
  }

  unwrapOr(defaultValue: T): T {
    return this.isOk() ? this.value : defaultValue
  }

  unwrapOrElse(fn: (error: E) => T): T {
    if (this.isOk()) {
      return this.value
    }
    if (this.isErr()) {
      return fn(this.error)
    }
    throw new Error('Invalid Result state')
  }

  expect(message: string): T {
    if (this.isOk()) {
      return this.value
    }
    if (this.isErr()) {
      throw new Error(`${message}: ${this.error}`)
    }
    throw new Error('Invalid Result state')
  }

  // Map методы
  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this.isOk()) {
      return ok(fn(this.value))
    }
    if (this.isErr()) {
      return err(this.error)
    }
    throw new Error('Invalid Result state')
  }

  mapErr<F>(fn: (error: E) => F): Result<T, F> {
    if (this.isOk()) {
      return ok(this.value)
    }
    if (this.isErr()) {
      return err(fn(this.error))
    }
    throw new Error('Invalid Result state')
  }

  // And/Or методы
  and<U>(other: Result<U, E>): Result<U, E> {
    if (this.isOk()) {
      return other
    }
    if (this.isErr()) {
      return err(this.error)
    }
    throw new Error('Invalid Result state')
  }

  andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this.isOk()) {
      return fn(this.value)
    }
    if (this.isErr()) {
      return err(this.error)
    }
    throw new Error('Invalid Result state')
  }

  or(other: Result<T, E>): Result<T, E> {
    return this.isOk() ? this : other
  }

  orElse<F>(fn: (error: E) => Result<T, F>): Result<T, F> {
    if (this.isOk()) {
      return ok(this.value)
    }
    if (this.isErr()) {
      return fn(this.error)
    }
    throw new Error('Invalid Result state')
  }

  // Match method для pattern matching
  match<U>(onOk: (value: T) => U, onErr: (error: E) => U): U {
    if (this.isOk()) {
      return onOk(this.value)
    }
    if (this.isErr()) {
      return onErr(this.error)
    }
    throw new Error('Invalid Result state')
  }
}

export class Ok<T, E> extends Result<T, E> {
  constructor(public readonly value: T) {
    super()
  }

  isOk(): this is Ok<T, E> {
    return true
  }

  isErr(): this is Err<T, E> {
    return false
  }
}

export class Err<T, E> extends Result<T, E> {
  constructor(public readonly error: E) {
    super()
  }

  isOk(): this is Ok<T, E> {
    return false
  }

  isErr(): this is Err<T, E> {
    return true
  }
}

// Helper functions
export const ok = <T, E = never>(value: T): Result<T, E> => new Ok(value)
export const err = <T = never, E = unknown>(error: E): Result<T, E> => new Err(error)

// Try function для автоматического оборачивания в Result
export function tryFn<T, E = Error>(fn: () => T): Result<T, E> {
  try {
    return ok(fn())
  } catch (error) {
    return err(error as E)
  }
}

export async function tryAsync<T, E = Error>(fn: () => Promise<T>): Promise<Result<T, E>> {
  try {
    const result = await fn()
    return ok(result)
  } catch (error) {
    return err(error as E)
  }
}

// Option type для nullable values
export abstract class Option<T> {
  abstract isSome(): this is Some<T>
  abstract isNone(): this is None<T>

  unwrap(): T {
    if (this.isSome()) {
      return this.value
    }
    throw new Error('Called unwrap on a None value')
  }

  unwrapOr(defaultValue: T): T {
    return this.isSome() ? this.value : defaultValue
  }

  map<U>(fn: (value: T) => U): Option<U> {
    return this.isSome() ? some(fn(this.value)) : none()
  }

  andThen<U>(fn: (value: T) => Option<U>): Option<U> {
    return this.isSome() ? fn(this.value) : none()
  }

  okOr<E>(error: E): Result<T, E> {
    return this.isSome() ? ok(this.value) : err(error)
  }
}

export class Some<T> extends Option<T> {
  constructor(public readonly value: T) {
    super()
  }

  isSome(): this is Some<T> {
    return true
  }

  isNone(): this is None<T> {
    return false
  }
}

export class None<T> extends Option<T> {
  isSome(): this is Some<T> {
    return false
  }

  isNone(): this is None<T> {
    return true
  }
}

export const some = <T>(value: T): Option<T> => new Some(value)
export const none = <T = never>(): Option<T> => new None()