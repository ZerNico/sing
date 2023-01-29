// electron.vite.config.ts
import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import Vue from "@vitejs/plugin-vue";
import Pages from "vite-plugin-pages";
import Components from "unplugin-vue-components/vite";
import AutoImport from "unplugin-auto-import/vite";
import Unocss from "unocss/vite";
import VueMacros from "unplugin-vue-macros/vite";
import svgLoader from "vite-svg-loader";
var electron_vite_config_default = defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src")
      }
    },
    plugins: [
      VueMacros({
        plugins: {
          vue: Vue({
            reactivityTransform: true
          })
        }
      }),
      Pages(),
      AutoImport({
        imports: [
          "vue",
          "vue/macros",
          "vue-router",
          "@vueuse/core",
          "pinia",
          {
            "@tanstack/vue-query": ["useQuery", "useMutation"]
          }
        ],
        dts: "src/auto-imports.d.ts",
        dirs: ["./src/composables", "./src/stores"],
        vueTemplate: true
      }),
      Components({
        dts: "src/components.d.ts"
      }),
      Unocss(),
      svgLoader()
    ]
  }
});
export {
  electron_vite_config_default as default
};
