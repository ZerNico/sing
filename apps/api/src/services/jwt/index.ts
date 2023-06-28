import { JWTPayload, jwtVerify, SignJWT } from 'jose'

import { env } from '../../config/env'

export class JwtService {
  private readonly secret = new TextEncoder().encode(env.JWT_SECRET)

  public async signJwt<T>(payload: Omit<T, 'iss' | 'aud' | 'exp'>) {
    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer(env.API_ORIGIN)
      .setAudience(env.API_ORIGIN)
      .setExpirationTime('2d')
      .sign(this.secret)
    return jwt
  }

  public async verifyJwt<T extends JWTPayload>(jwt: string) {
    const { payload } = await jwtVerify(jwt, this.secret, { issuer: env.API_ORIGIN, audience: env.API_ORIGIN })
    return payload as T
  }
}
