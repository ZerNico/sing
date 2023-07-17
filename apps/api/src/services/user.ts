import { eq, schema } from 'database'

import { db } from '../db/index.js'

class UserService {
  async getOne(id: string) {
    return await db.query.user.findFirst({ where: eq(schema.user.id, id) })
  }

  async getOneWithLobbyWithUsers(id: string) {
    return await db.query.user.findFirst({
      where: eq(schema.user.id, id),
      with: {
        lobby: {
          with: {
            users: true,
          },
        },
      },
    })
  }
}

export const userService = new UserService()
