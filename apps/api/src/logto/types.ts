export interface TokenResponse {
  access_token: string
  expires_in: number
  token_type: string
}

export interface PatchUserPayload {
  username?: string
  avatar?: string
}

export interface LogtoUser {
  id: string
  username: string
  avatar: string
}
