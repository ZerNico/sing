import { Hono } from 'hono'
import { z } from 'zod'

import { getLobbyAuthPayload, verifyLobbyAuth } from '../middleware/lobby-auth.ts'
import { zodMiddleware } from '../middleware/zod.ts'
import { lobbyService } from '../services/lobby.ts'

export const lobbyApp = new Hono()
  .post(
    '/',
    zodMiddleware(
      'json',
      z.object({
        version: z.string(),
      })
    ),
    async (c) => {
      const { version } = c.req.valid('json')
      lobbyService.checkVersion(version)
      const lobby = await lobbyService.create()
      const token = await lobbyService.generateToken(lobby.id, lobby.code)

      return c.jsonT({ lobby, token })
    }
  )
  .get('/current', verifyLobbyAuth(), async (c) => {
    const payload = getLobbyAuthPayload(c)

    const lobby = await lobbyService.findOne(payload.sub)

    return c.jsonT({ lobby: lobby })
  })
