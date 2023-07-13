import { Context, MiddlewareHandler } from 'hono'

import { HonoError } from '../error/index.js'
import { LobbyJWTPayload, lobbyService } from '../services/lobby.js'

const LOBBY_AUTH_PAYLOAD_KEY = 'lobby-auth-payload-key'

export const verifyLobbyAuth = (): MiddlewareHandler => {
  return async (c, next) => {
    const authHeader = c.req.header('authorization')

    const token = authHeader?.split(' ').at(1)

    if (!token) {
      throw new HonoError({ message: 'unauthorized', status: 401 })
    }

    const payload = await lobbyService.verifyToken(token)
    setLobbyAuthPayload(c, payload)

    await next()
  }
}

const setLobbyAuthPayload = (c: Context, payload: LobbyJWTPayload) => c.set(LOBBY_AUTH_PAYLOAD_KEY, payload)

export const getLobbyAuthPayload = (c: Context): LobbyJWTPayload => c.get(LOBBY_AUTH_PAYLOAD_KEY)
