import importMetaEnv from "@import-meta-env/unplugin";
import tailwindcss from "@tailwindcss/vite";
import icons from "unplugin-icons/vite";
import { defineConfig } from "vite";
import pages from "vite-plugin-pages";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [
    importMetaEnv.vite({
      example: ".env.example",
      env: ".env",
    }),
    solid(),
    tailwindcss(),
    pages(),
    icons({ compiler: "solid" }),
  ],
  server: {
    port: 3001,
  },
  resolve: { alias: { "~": "/src" } },
  build: {
    target: "esnext",
  },
});
