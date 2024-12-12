import { defineConfig, presetIcons, presetUno } from "unocss";

export default defineConfig({
  presets: [presetUno(), presetIcons()],
  theme: {
    fontFamily: {
      primary: `"Inter Variable",${presetUno()?.theme?.fontFamily?.sans}`,
    },
    colors: {
      night: {
        "50": "#f0f4fd",
        "100": "#e3ebfc",
        "200": "#ccd8f9",
        "300": "#adbdf4",
        "400": "#8c9bed",
        "500": "#7079e4",
        "600": "#5556d6",
        "700": "#4645bd",
        "800": "#3b3c98",
        "900": "#363879",
        "950": "#101024",
      },
    },
  },
});
