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
  ssr: true,
  server: {
    preset: "bun",
  },
});
