import { defineConfig } from "@solidjs/start/config";
import UnoCSS from "unocss/vite";

export default defineConfig({
  vite: {
    plugins: [UnoCSS({})],
    server: {
      hmr: {
        host: "localhost",
        protocol: "ws",
      },
    },
  },
  ssr: false,
  server: {
    preset: "bun",
  },
});
