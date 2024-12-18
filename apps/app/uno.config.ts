import { defineConfig, presetIcons, presetUno } from "unocss";

export default defineConfig({
  presets: [presetUno(), presetIcons()],
  theme: {
    fontFamily: {
      primary: `"Inter Variable",${presetUno()?.theme?.fontFamily?.sans}`,
    },
    colors: {
      blue: {
        start: "#36D1DC",
        end: "#5B86E5",
        center: "#49ACE1",
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
