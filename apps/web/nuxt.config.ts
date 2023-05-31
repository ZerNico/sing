import pkg from './package.json'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@unocss/nuxt', '@nuxtjs/i18n', '@zernico/nuxt-logto', '@vue-macros/nuxt', '@nuxt/devtools'],
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
      apiUrl: '',
      appVersion: pkg.version,
      logto: {
        appId: '',
        origin: '',
      },
    },
    logto: {
      appSecret: '',
      endpoint: '',
      cookieSecure: false,
      cookieSecret: '',
      resources: '',
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
})
