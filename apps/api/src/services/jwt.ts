import { JWTPayload, jwtVerify, SignJWT } from 'jose'

import { env } from '../config/env.js'

class JwtService {
  private readonly secret = new TextEncoder().encode(env.API_JWT_SECRET)

  async sign<T extends Omit<JWTPayload, 'iss' | 'aud' | 'exp'>>(payload: T) {
    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer(env.API_ORIGIN)
      .setAudience(env.API_ORIGIN)
      .setExpirationTime('2d')
      .sign(this.secret)
    return jwt
  }

  async verify<T extends JWTPayload>(token: string) {
    const { payload } = await jwtVerify(token, this.secret, { issuer: env.API_ORIGIN, audience: env.API_ORIGIN })
    return payload as T
  }
}

export const jwtService = new JwtService()
