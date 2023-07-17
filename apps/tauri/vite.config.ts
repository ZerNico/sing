import { fileURLToPath } from 'node:url'

import VueI18n from '@intlify/unplugin-vue-i18n/vite'
import { ValidateEnv } from '@julr/vite-plugin-validate-env'
import Vue from '@vitejs/plugin-vue'
import Unocss from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import VueMacros from 'unplugin-vue-macros/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'

import pkg from './package.json'

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },

  resolve: {
    alias: [{ find: '~/', replacement: fileURLToPath(new URL('src/', import.meta.url)) }],
  },

  plugins: [
    ValidateEnv(),

    VueRouter({
      routesFolder: 'src/pages',
      dts: 'src/typed-router.d.ts',
      importMode: 'async',
    }),

    VueMacros({
      plugins: {
        vue: Vue({
          reactivityTransform: true,
        }),
      },
    }),

    AutoImport({
      imports: [
        'vue',
        'vue/macros',
        'vue-i18n',
        VueRouterAutoImports,
        '@vueuse/core',
        'pinia',
        {
          '@tanstack/vue-query': ['useQuery', 'useMutation'],
        },
      ],
      dts: 'src/auto-imports.d.ts',
      dirs: ['./src/composables', './src/stores'],
      vueTemplate: true,
    }),

    Components({
      dts: 'src/components.d.ts',
    }),

    Unocss(),

    VueI18n({
      runtimeOnly: true,
      compositionOnly: true,
      fullInstall: true,
      include: [fileURLToPath(new URL('locales/**', import.meta.url))],
    }),
  ],

  optimizeDeps: {
    exclude: ['vue-demi'],
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  // prevent vite from obscuring rust errors
  clearScreen: false,
  // tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
  },
  // to make use of `TAURI_DEBUG` and other env variables
  // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    // Tauri supports es2021
    target: process.env.TAURI_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
    // don't minify for debug builds
    minify: process.env.TAURI_DEBUG ? false : 'esbuild',
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,
  },
}))
