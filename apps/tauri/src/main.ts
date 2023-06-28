import './assets/styles/styles.scss'
import '@unocss/reset/tailwind.css'
import 'uno.css'

import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createApp } from 'vue'
import { createWebHashHistory } from 'vue-router'
import { createRouter } from 'vue-router/auto'

import App from './App.vue'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

const router = createRouter({
  history: createWebHashHistory(),
})
app.use(router)

app.mount('#app')
