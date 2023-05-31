import { ofetch } from 'ofetch'
import { joinURL } from 'ufo'
import { env } from '../config/env'
import { LogtoUser, PatchUserPayload } from './types'
import { createM2MToken } from './jwt'
import { LogtoError } from './error'

export class ManagementApiClient {
  private token?: string
  private tokenExpiresAt?: Date

  async getToken() {
    // check if token exists and is not expiring within the next 30 seconds
    if (this.token && this.tokenExpiresAt && this.tokenExpiresAt.getTime() - Date.now() > 30 * 1000) {
      return this.token
    }
    const tokenResponse = await createM2MToken()
    this.token = tokenResponse.access_token
    this.tokenExpiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000)

    return this.token
  }

  public async patchUser(userId: string, data: PatchUserPayload) {
    const response = await ofetch<LogtoUser>(joinURL(env.LOGTO_URL, 'api', 'users', userId), {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${await this.getToken()}`,
      },
      body: data,
    }).catch((err) => {
      throw new LogtoError(err.data)
    })
    return response
  }

  public async getUser(userId: string) {
    const response = await ofetch<LogtoUser>(joinURL(env.LOGTO_URL, 'api', 'users', userId), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${await this.getToken()}`,
      },
    }).catch((err) => {
      throw new LogtoError(err.data)
    })
    return response
  }

  public async verifyPassword(userId: string, password: string) {
    if (password.length === 0)
      throw new LogtoError({ code: 'session.invalid_credentials', message: 'Invalid credentials.' })

    const response = await ofetch<LogtoUser>(joinURL(env.LOGTO_URL, 'api', 'users', userId, 'password', 'verify'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${await this.getToken()}`,
      },
      body: {
        password,
      },
    }).catch((err) => {
      throw new LogtoError(err.data)
    })
    return response
  }

  public async updatePassword(userId: string, password: string) {
    const response = await ofetch<LogtoUser>(joinURL(env.LOGTO_URL, 'api', 'users', userId, 'password'), {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${await this.getToken()}`,
      },
      body: {
        password: password,
      },
    }).catch((err) => {
      throw new LogtoError(err.data)
    })
    return response
  }

  public async hasPassword(userId: string) {
    const response = await ofetch<{ hasPassword: boolean }>(
      joinURL(env.LOGTO_URL, 'api', 'users', userId, 'has-password'),
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${await this.getToken()}`,
        },
      }
    ).catch((err) => {
      throw new LogtoError(err.data)
    })

    return response
  }
}
