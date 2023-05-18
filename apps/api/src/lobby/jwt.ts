import { SignJWT, jwtVerify } from 'jose'
import { env } from '../config/env'

const secret = new TextEncoder().encode(env.JWT_SECRET)

export const generateLobbyJwt = async (lobbyId: string, lobbyCode: string) => {
  const jwt = await new SignJWT({ sub: lobbyId, code: lobbyCode })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(env.API_ORIGIN)
    .setAudience(env.API_ORIGIN)
    .setExpirationTime('7d')
    .sign(secret)
  return jwt
}

export const verifyLobbyJwt = async (token: string) => {
  const { payload } = await jwtVerify(token, secret, {
    issuer: env.API_ORIGIN,
    audience: env.API_ORIGIN,
  })
  return payload as { sub: string; code: string }
}
