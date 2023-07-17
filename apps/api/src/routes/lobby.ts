import { Hono } from 'hono'
import { z } from 'zod'

import { HonoError } from '../error/index.js'
import { getAuthSession, verifyAuth } from '../middleware/auth.js'
import { getCombinedAuth, verifyCombinedAuth } from '../middleware/combined-auth.js'
import { getLobbyAuthPayload, verifyLobbyAuth } from '../middleware/lobby-auth.js'
import { zodMiddleware } from '../middleware/zod.js'
import { lobbyService } from '../services/lobby.js'
import { userService } from '../services/user.js'

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
  .get('/current', verifyCombinedAuth(), async (c) => {
    const auth = getCombinedAuth(c)

    if (auth.type === 'lobby') {
      const lobby = await lobbyService.getOneWithUsers(auth.data.sub)

      if (!lobby) throw new HonoError({ message: 'lobby_not_found', status: 404 })

      return c.jsonT({ lobby })
    } else {
      const user = await userService.getOneWithLobbyWithUsers(auth.data.user.userId)
      if (!user || !user.lobby) throw new HonoError({ message: 'lobby_not_found', status: 404 })

      return c.jsonT({ lobby: user.lobby })
    }
  })
  .delete('/current', verifyLobbyAuth(), async (c) => {
    const payload = getLobbyAuthPayload(c)

    const lobby = await lobbyService.remove(payload.sub)

    if (!lobby) throw new HonoError({ message: 'lobby_not_found', status: 404 })

    return c.jsonT({ success: true })
  })
  .delete('/current/users/:userId', verifyLobbyAuth(), async (c) => {
    const payload = getLobbyAuthPayload(c)
    const userId = c.req.param('userId')

    await lobbyService.removeUser(payload.sub, userId)

    return c.jsonT({ success: true })
  })
  .post('/:lobbyCode/join', verifyAuth(), async (c) => {
    const lobbyCode = c.req.param('lobbyCode')
    const session = getAuthSession(c)

    const lobby = await lobbyService.getOneByCode(lobbyCode)
    if (!lobby) throw new HonoError({ message: 'lobby_not_found' })

    await lobbyService.addUser(lobby.id, session.user.userId)

    return c.jsonT({ success: true })
  })
  .delete('/current/users/leave', verifyAuth(), async (c) => {
    const session = getAuthSession(c)
    const user = await userService.getOne(session.user.userId)

    if (!user?.lobbyId) throw new HonoError({ message: 'lobby_not_found', status: 404 })

    await lobbyService.removeUser(user.lobbyId, session.user.userId)

    return c.jsonT({ success: true })
  })
