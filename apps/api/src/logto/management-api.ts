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
}
