import { sign, verify } from 'jsonwebtoken'
import { env } from '../config/env'

export interface JwtPayload {
  sub: string
  code: string
}

export const signJwt = (payload: JwtPayload) => {
  const token = sign(payload, env.JWT_SECRET, { expiresIn: '7d' })
  return token
}

export const verifyJwt = (token: string) => {
  const payload = verify(token, env.JWT_SECRET) as JwtPayload
  return payload
}
