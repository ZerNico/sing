import { eq, schema } from 'database'
import { JWTPayload } from 'jose'
import Postgres from 'postgres'
import { satisfies } from 'semver'

import { MININUM_VERSION } from '../constants.ts'
import { db } from '../db/index.ts'
import { HonoError } from '../error/index.ts'
import { jwtService } from './jwt.ts'

export interface LobbyJWTPayload extends JWTPayload {
  sub: string
  id: string
}

class LobbyService {
  checkVersion(version: string) {
    if (!satisfies(version, `>=${MININUM_VERSION}`)) {
      throw new HonoError({ message: 'client_outdated', status: 400 })
    }
  }

  generateCode(length: number) {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
  }

  async create() {
    let tries = 0
    let length = 4

    do {
      const code = this.generateCode(length)
      try {
        const lobbies = await db.insert(schema.lobby).values({ code }).returning()
        const createdLobby = lobbies.at(0)
        if (!createdLobby) throw new HonoError({ message: 'failed_to_create_lobby' })
        return createdLobby
      } catch (error) {
        if (error instanceof Postgres.PostgresError && error.code === '23505') {
          tries++
          if (tries > 10) {
            length++
            tries = 0
          }
        } else {
          throw error
        }
      }
      // eslint-disable-next-line no-constant-condition
    } while (true)
  }

  async findOne(code: string) {
    return await db.query.lobby.findFirst({ with: { users: true }, where: eq(schema.lobby.code, code) })
  }

  async generateToken(id: string, code: string) {
    return await jwtService.sign<LobbyJWTPayload>({ id, sub: code })
  }

  async verifyToken(token: string) {
    try {
      return await jwtService.verify<LobbyJWTPayload>(token)
    } catch {
      throw new HonoError({ message: 'unauthorized', status: 401 })
    }
  }
}

export const lobbyService = new LobbyService()
