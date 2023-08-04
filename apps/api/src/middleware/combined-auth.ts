import { Context, Next } from 'hono'

import { auth, getAuthSession } from './auth.js'
import { getLobbyAuthPayload, lobbyAuth } from './lobby-auth.js'

export const combinedAuth = () => {
  return async (c: Context, next: Next) => {
    try {
      await auth()(c, next)
    } catch {
      await lobbyAuth()(c, next)
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
