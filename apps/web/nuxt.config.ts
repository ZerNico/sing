// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  modules: [
    '@sidebase/nuxt-auth',
    '@unocss/nuxt',
    '@vueuse/nuxt',
    'nuxt-headlessui',
    'nuxt-typed-router',
  ],
  auth: {
    enableGlobalAppMiddleware: false,
    defaultProvider: 'zitadel',
  },
  runtimeConfig: {
    zitadelClientId: '',
    zitadelClientSecret: '',
    zitadelOrgDomain: '',
    authSecret: '',
    public: {
      zitadelIssuer: '',
      apiUrl: '',
    },
  },
  unocss: {
    preflight: true,
  },
})
