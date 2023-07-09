/// <reference types="lucia" />
declare namespace Lucia {
  type Auth = import('./auth/index.ts').Auth
  type DatabaseUserAttributes = {
    username: string
    disabled: boolean
  }
  // eslint-disable-next-line @typescript-eslint/ban-types
  type DatabaseSessionAttributes = {}
}
