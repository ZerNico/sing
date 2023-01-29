import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { VueQueryPlugin } from '@tanstack/vue-query'
import routes from 'virtual:generated-pages'
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

loadGuards(router)

app.use(router)
app.use(pinia)
app.use(VueQueryPlugin)
app.mount('#app')
