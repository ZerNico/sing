import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { VueQueryPlugin } from '@tanstack/vue-query'
import routes from 'virtual:generated-pages'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'

import '@unocss/reset/tailwind.css'
import 'uno.css'
import { loadGuards } from './router-guards'

const app = createApp(App)
const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

loadGuards(router)

app.use(router)
app.use(pinia)
app.use(VueQueryPlugin)
app.mount('#app')
