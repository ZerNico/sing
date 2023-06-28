interface GenericJWTPayload {
  iss: string
  aud: string
  exp: number
}

export interface LobbyJwtPayload extends GenericJWTPayload {
  sub: string
  code: string
}
