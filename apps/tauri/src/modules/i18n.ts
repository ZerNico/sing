import messages from '@intlify/unplugin-vue-i18n/messages'
import { createI18n } from 'vue-i18n'

import { UserModule } from '~/types'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages,
})

export const install: UserModule = ({ app }) => {
  app.use(i18n)
}