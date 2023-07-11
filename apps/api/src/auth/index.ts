import { postgres } from '@lucia-auth/adapter-postgresql'
import { schema } from 'database'
import { lucia } from 'lucia'
import { web } from 'lucia/middleware'

import { connection } from '../db/index.ts'

export const auth = lucia({
  adapter: postgres(connection, schema.tables),
  middleware: web(),
  env: 'DEV',
  sessionCookie: {
    expires: false,
  },
  getUserAttributes: (data) => {
    return {
      username: data.username,
      disabled: data.disabled,
    }
  },
})

export type Auth = typeof auth
