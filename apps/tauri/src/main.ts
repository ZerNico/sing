import './assets/styles/styles.scss'
import '@unocss/reset/tailwind.css'
import 'uno.css'
import '@fontsource/open-sans/latin.css'

import { createApp } from 'vue'
import { createMemoryHistory } from 'vue-router'
import { createRouter } from 'vue-router/auto'

import App from './App.vue'
import { UserModule } from './types'

const app = createApp(App)
const router = createRouter({
  history: createMemoryHistory(),
})
app.use(router)

for (const i of Object.values(import.meta.glob<{ install: UserModule }>('./modules/*.ts', { eager: true }))) {
  i.install?.({ app, router })
}

app.mount('#app')
