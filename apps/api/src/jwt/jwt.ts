import { sign } from 'jsonwebtoken'
import { env } from '../config/env'

interface JwtPayload {
  sub: string
  code: string
}

export const signJwt = (payload: JwtPayload) => {
  const token = sign(payload, env.JWT_SECRET, { expiresIn: '7d' })
  return token
}
