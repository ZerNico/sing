import { VueQueryPlugin } from '@tanstack/vue-query'

import { UserModule } from '~/types'

export const install: UserModule = ({ app }) => {
  app.use(VueQueryPlugin)
}
