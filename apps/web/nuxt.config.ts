// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@sidebase/nuxt-auth',
    '@unocss/nuxt',
    '@vueuse/nuxt',
    'nuxt-headlessui',
    'nuxt-typed-router',
  ],
  runtimeConfig: {
    zitadelIssuer: '',
    zitadelClientId: '',
    zitadelClientSecret: '',
    zitadelOrgDomain: '',
    authSecret: '',
  },
})
