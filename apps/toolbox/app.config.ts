import { defineConfig } from "@solidjs/start/config";
import UnoCSS from "unocss/vite";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  ssr: false,
  server: {
    preset: "static"
  },
  vite: {
    plugins: [UnoCSS()],
    server: {
      port: 1420,
      strictPort: true,
      host: host || false,
      hmr: host
        ? {
            protocol: "ws",
            host,
            port: 1421,
          }
        : undefined,
      watch: {
        ignored: ["**/src-tauri/**"],
      },
    },
  }
});
