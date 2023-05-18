import { jwtVerify } from 'jose'
import { joinURL } from 'ufo'
import { ofetch } from 'ofetch'
import { env } from '../config/env'
import { btoa } from '../utils/byte'
import { JWKS } from './jwks'
import { TokenResponse } from './types'

export const verifyLogtoJwt = async (token: string) => {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: joinURL(env.LOGTO_URL, 'oidc'),
    audience: env.LOGTO_AUDIENCE,
  })

  return payload
}

export const createM2MToken = async () => {
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    resource: env.LOGTO_M2M_RESOURCE,
    scope: 'all',
  })

  const response = await ofetch<TokenResponse>(joinURL(env.LOGTO_URL, 'oidc/token'), {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${env.LOGTO_M2M_APP_ID}:${env.LOGTO_M2M_APP_SECRET}`)})}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })

  return response
}
