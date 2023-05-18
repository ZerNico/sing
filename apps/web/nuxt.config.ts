// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@unocss/nuxt', '@nuxtjs/i18n', '@zernico/nuxt-logto', '@vue-macros/nuxt'],
  typescript: {
    tsConfig: {
      compilerOptions: {
        moduleResolution: 'bundler',
      },
    },
  },
  app: {
    head: {
      title: 'Tune Perfect',
    },
  },
  experimental: {
    typedPages: true,
  },
  unocss: {
    preflight: true,
  },
  runtimeConfig: {
    public: {
      apiUrl: process.env.API_URL,
    },
  },
  i18n: {
    defaultLocale: 'en',
    strategy: 'no_prefix',
    lazy: true,
    langDir: 'locales/',
    locales: [
      {
        code: 'en',
        name: 'English',
        file: 'en-US.json',
      },
      {
        code: 'de',
        name: 'Deutsch',
        file: 'de-DE.json',
      },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      //alwaysRedirect: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
  },
  logto: {
    appId: process.env.LOGTO_APP_ID,
    appSecret: process.env.LOGTO_APP_SECRET,
    endpoint: process.env.LOGTO_ENDPOINT,
    origin: process.env.ORIGIN,
    cookieSecret: process.env.LOGTO_COOKIE_SECRET,
    cookieSecure: process.env.NODE_ENV === 'production',
    resources: [process.env.LOGTO_RESOURCE!],
  },
})
