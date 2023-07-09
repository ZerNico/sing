import { postgres } from '@lucia-auth/adapter-postgresql'
import { tables } from 'database'
import { lucia } from 'lucia'
import { web } from 'lucia/middleware'

import { connection } from '../db/index.ts'

export const auth = lucia({
  adapter: postgres(connection, tables),
  middleware: web(),
  env: 'DEV',
  sessionCookie: {
    expires: false,
  },
  getUserAttributes: (data) => {
    return {
      username: data.username,
    }
  },
})

export type Auth = typeof auth
