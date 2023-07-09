import { zValidator } from '@hono/zod-validator'
import { Env, MiddlewareHandler, ValidationTargets } from 'hono'
import { z, ZodSchema } from 'zod'

import { HonoError } from '../error/index.ts'

export const zodMiddleware = <
  T extends ZodSchema,
  Target extends keyof ValidationTargets,
  E extends Env,
  P extends string,
  V extends {
    in: { [K in Target]: z.input<T> }
    out: { [K in Target]: z.output<T> }
  } = {
    in: { [K in Target]: z.input<T> }
    out: { [K in Target]: z.output<T> }
  }
>(
  target: Target,
  schema: T
): MiddlewareHandler<E, P, V> => {
  return zValidator(target, schema, (result) => {
    if (!result.success) {
      const zodErrors = result.error.flatten().fieldErrors
      throw new HonoError({ message: 'validation_failed', status: 403, validationErrors: zodErrors })
    }
  })
}
