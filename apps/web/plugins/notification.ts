import Notifications from '@kyvg/vue3-notification'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Notifications)
})
