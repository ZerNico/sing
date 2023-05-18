export class LogtoError extends Error {
  public message: string
  public code: string

  constructor({ message, code }: { message: string; code: string }) {
    super(message)
    this.message = message
    this.code = code

    Object.setPrototypeOf(this, LogtoError.prototype)
  }
}
