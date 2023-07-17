import { Hono } from 'hono'
import { z } from 'zod'

import { getAuthSession, verifyAuth } from '../middleware/auth.js'
import { zodMiddleware } from '../middleware/zod.js'
import { authService } from '../services/auth.js'

const authSchema = z.object({
  username: z.string().min(3, { message: 'username_too_short' }).max(32, { message: 'username_too_long' }),
  password: z.string().min(6, { message: 'password_too_short' }).max(255, { message: 'password_too_long' }),
})

export const authApp = new Hono()
  .get('/register', (c) => c.text('Hello Hono!'))
  .post('/register', zodMiddleware('json', authSchema), async (c) => {
    const { username, password } = c.req.valid('json')

    const user = await authService.createUser(username, password)
    const session = await authService.createSession(user.userId)

    return c.jsonT({ token: session.sessionId })
  })
  .post('/login', zodMiddleware('json', authSchema), async (c) => {
    const { username, password } = c.req.valid('json')

    const user = await authService.login(username, password)
    const session = await authService.createSession(user.userId)

    return c.jsonT({ token: session.sessionId })
  })
  .post('/logout', verifyAuth(), async (c) => {
    const session = getAuthSession(c)
    await authService.invalidateSession(session.sessionId)

    return c.jsonT({ success: true }, 200)
  })
