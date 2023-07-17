import { LuciaError } from 'lucia'

import { auth } from '../auth/index.js'
import { HonoError } from '../error/index.js'

class AuthService {
  async createUser(username: string, password: string) {
    try {
      const user = await auth.createUser({
        key: {
          providerId: 'username',
          providerUserId: username,
          password,
        },
        attributes: {
          username,
          disabled: false,
        },
      })
      return user
    } catch (error) {
      // TODO: check for DB error when unique is implemented in drizzle
      if (error instanceof LuciaError && error.message === 'AUTH_DUPLICATE_KEY_ID') {
        throw new HonoError({ message: 'auth_username_taken', status: 409 })
      }
      throw error
    }
  }

  async login(username: string, password: string) {
    try {
      return await auth.useKey('username', username, password)
    } catch (error) {
      if (
        error instanceof LuciaError &&
        (error.message === 'AUTH_INVALID_KEY_ID' || error.message === 'AUTH_INVALID_PASSWORD')
      ) {
        throw new HonoError({ message: 'auth_invalid_credentials', status: 401 })
      }
      throw error
    }
  }

  async createSession(userId: string) {
    const session = await auth.createSession({
      userId,
      attributes: {},
    })
    return session
  }

  async verifySession(req: Request) {
    const authRequest = auth.handleRequest(req)
    const session = await authRequest.validateBearerToken()

    return session
  }

  async invalidateSession(sessionId: string) {
    await auth.invalidateSession(sessionId)
  }
}

export const authService = new AuthService()
