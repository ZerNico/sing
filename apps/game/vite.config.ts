import tailwindcss from "@tailwindcss/vite";
import { FileSystemIconLoader } from "unplugin-icons/loaders";
import icons from "unplugin-icons/vite";
import { defineConfig } from "vite";
import pages from "vite-plugin-pages";
import solid from "vite-plugin-solid";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  plugins: [
    solid(),
    tailwindcss(),
    pages(),
    icons({
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
