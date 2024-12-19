import { defineConfig, presetIcons, presetUno } from "unocss";

export default defineConfig({
  presets: [presetUno(), presetIcons()],
  theme: {
    fontFamily: {
      primary: `"Inter Variable",${presetUno()?.theme?.fontFamily?.sans}`,
    },
    colors: {
      cyan: {
        "50": "#eefdfd",
        "100": "#d3fafa",
        "200": "#adf2f4",
        "300": "#74e6ec",
        "400": "#36d1dc",
        "500": "#18b4c2",
        "600": "#1791a3",
        "700": "#1a7484",
        "800": "#1e5f6c",
        "900": "#1d4f5c",
        "950": "#0d343f",
      },
      blue: {
        "50": "#f1f5fd",
        "100": "#dfe9fa",
        "200": "#c5d9f8",
        "300": "#9ec0f2",
        "400": "#709fea",
        "500": "#5b86e5",
        "600": "#3960d7",
        "700": "#304dc5",
        "800": "#2d40a0",
        "900": "#29397f",
        "950": "#1d254e",
      },
      red: {
        start: "#F3696E",
        end: "#F78102",
        center: "#FF7373",
      },
      error: "#F3696E",
      success: "#4ade80",
      warning: "#fbbf24",
      info: "#60a5fa",
    },
    animation: {
      keyframes: {
        slideIn: "{from{transform:translateX(calc(100%))}to{transform:translateX(0)}}",
      },
    },
  },
});
