import UnoCSS from "@unocss/vite";
import { FileSystemIconLoader } from "unplugin-icons/loaders";
import Icons from "unplugin-icons/vite";
import { defineConfig } from "vite";
import Pages from "vite-plugin-pages";
import Solidjs from "vite-plugin-solid";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  plugins: [
    Solidjs(),
    UnoCSS(),
    Pages(),
    Icons({
      customCollections: {
        sing: FileSystemIconLoader("./src/assets/icons"),
      },
      compiler: "solid",
    }),
  ],
  optimizeDeps: {
    entries: ["index.html", "src/pages/**/*.tsx"],
    holdUntilCrawlEnd: true,
  },
  resolve: { alias: { "~": "/src" } },
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
  build: {
    target: "esnext",
  },
});
