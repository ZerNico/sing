import { defineConfig } from "@solidjs/start/config";
import UnoCSS from "unocss/vite";
import Icons from "unplugin-icons/vite";

export default defineConfig({
  vite: {
    plugins: [UnoCSS({}), Icons({ compiler: "solid" })],
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
