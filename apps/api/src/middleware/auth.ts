import { Context, MiddlewareHandler } from 'hono'
import { Session } from 'lucia'

import { HonoError } from '../error/index.js'
import { authService } from '../services/auth.js'

const AUTH_SESSION_KEY = 'auth-session-key'

export const verifyAuth = (): MiddlewareHandler => {
  return async (c, next) => {
    const session = await authService.verifySession(c.req.raw)

    if (!session) {
      throw new HonoError({ message: 'unauthorized', status: 401 })
    }

    setAuthSession(c, session)

    await next()
  }
}

const setAuthSession = (c: Context, session: Session) => c.set(AUTH_SESSION_KEY, session)

export const getAuthSession = (c: Context): Session => c.get(AUTH_SESSION_KEY)
