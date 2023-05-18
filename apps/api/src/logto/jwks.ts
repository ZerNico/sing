import { createRemoteJWKSet } from 'jose'
import { joinURL } from 'ufo'
import { env } from '../config/env'

export const JWKS = createRemoteJWKSet(new URL(joinURL(env.LOGTO_URL, 'oidc', 'jwks')))
