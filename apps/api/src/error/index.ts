import { Context } from 'hono'

export class HonoError extends Error {
  constructor(options: {
    message: ErrorMessage
    status?: number
    validationErrors?: Record<string, string[]>
    cause?: Error
  }) {
    super(options.message)
    this.message = options.message
    this.status = options.status
    this.validationErrors = options.validationErrors
    this.cause = options.cause
  }
  public message: ErrorMessage
  public status?: number
  public validationErrors?: Record<string, string[]>
  public cause?: Error
}

export class HonoClientError extends Error {
  constructor(options: {
    message: ClientErrorMessage
    status?: number
    validationErrors?: Record<string, string[]>
    cause?: string
  }) {
    super(options.message)
    this.message = options.message
    this.status = options.status
    this.validationErrors = options.validationErrors
    this.cause = options.cause
  }
  public message: ClientErrorMessage
  public status?: number
  public validationErrors?: Record<string, string[]>
  public cause?: string
}

export type ErrorMessage =
  | 'unknown_error'
  | 'validation_failed'
  | 'auth_username_taken'
  | 'auth_invalid_credentials'
  | 'client_outdated'
  | 'failed_to_create_lobby'
  | 'lobby_not_found'
  | 'unauthorized'

export type ClientErrorMessage = ErrorMessage | 'could_not_connect'

export interface ErrorDto {
  error: ErrorMessage
  validationErrors?: Record<string, string[]>
  cause?: string
}

export const errorHandler = (error: Error, c: Context) => {
  if (error instanceof HonoError) {
    const response: ErrorDto = {
      error: error.message,
      validationErrors: error.validationErrors,
      cause: error.cause?.stack,
    }
    return c.json(response, error.status || 500)
  }

  const response: ErrorDto = {
    error: 'unknown_error',
    cause: error.stack,
  }
  return c.json(response, 500)
}
