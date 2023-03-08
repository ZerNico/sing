import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import Vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Unocss from 'unocss/vite'
import VueMacros from 'unplugin-vue-macros/vite'
import svgLoader from 'vite-svg-loader'
import VueRouter from 'unplugin-vue-router/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
      },
    },
    optimizeDeps: {
      exclude: ['vue-demi'],
    },
    plugins: [
      VueRouter({
        routesFolder: 'src/renderer/src/pages',
        dts: 'src/renderer/src/typed-router.d.ts',
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

      svgLoader(),
    ],
  },
})
