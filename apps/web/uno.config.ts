import { defineConfig, presetIcons, presetUno } from "unocss";
import { colors } from "unocss/preset-mini";

export default defineConfig({
  presets: [presetUno(), presetIcons()],
  theme: {
    fontFamily: {
      primary: `"Open Sans Variable",${presetUno()?.theme?.fontFamily?.sans}`,
    },
    colors: {
      spearmint: {
        "50": "#effef3",
        "100": "#d8ffe6",
        "200": "#b4fecf",
        "300": "#7afbab",
        "400": "#38ef7d",
        "500": "#0fd85b",
        "600": "#06b348",
        "700": "#098c3c",
        "800": "#0d6e33",
        "900": "#0d5a2d",
        "950": "#003316",
      },
    },
    teal: {
      "50": "#f0fdfa",
      "100": "#cdfaf0",
      "200": "#9bf4e4",
      "300": "#61e7d3",
      "400": "#31d0bd",
      "500": "#18b4a4",
      "600": "#11998e",
      "700": "#11746d",
      "800": "#135c58",
      "900": "#144d49",
      "950": "#052e2d",
    },
  },
});
