import { defineConfig, presetIcons, presetUno } from "unocss";

export default defineConfig({
  presets: [presetUno(), presetIcons()],
  theme: {
    fontFamily: {
      primary: `"Inter Variable",${presetUno()?.theme?.fontFamily?.sans}`,
    },
  },
});
