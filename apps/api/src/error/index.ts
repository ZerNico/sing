import { z } from 'zod'

export class HonoError extends Error {
  constructor(options: {
    message: ErrorMessage
    status?: number
    validationErrors?: z.typeToFlattenedError<unknown, string>['fieldErrors']
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
  public validationErrors?: z.typeToFlattenedError<unknown, string>['fieldErrors']
  public cause?: Error
}

export type ErrorMessage = 'unknown_error' | 'validation_failed' | 'auth_username_taken' | 'auth_invalid_credentials'
