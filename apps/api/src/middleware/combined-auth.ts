import { Context, MiddlewareHandler } from 'hono'

import { getAuthSession, verifyAuth } from './auth.js'
import { getLobbyAuthPayload, verifyLobbyAuth } from './lobby-auth.js'

export const verifyCombinedAuth = (): MiddlewareHandler => {
  return async (c, next) => {
    try {
      await verifyAuth()(c, next)
    } catch {
      await verifyLobbyAuth()(c, next)
    }
  }
}

export const getCombinedAuth = (c: Context) => {
  const session = getAuthSession(c)
  const lobby = getLobbyAuthPayload(c)

  if (session) {
    return {
      type: 'auth',
      data: session,
    } as const
  }

  return {
    type: 'lobby',
    data: lobby,
  } as const
}
