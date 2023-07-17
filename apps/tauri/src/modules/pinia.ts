import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import { UserModule } from '~/types'

export const install: UserModule = ({ app }) => {
  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)
  app.use(pinia)
}
