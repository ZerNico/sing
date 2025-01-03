import { defineConfig, presetIcons, presetUno } from "unocss";

export default defineConfig({
  presets: [presetUno(), presetIcons()],
  shortcuts: {
    "gradient-sing": "from-green-400 to-teal-600",
    "gradient-party": "from-pink-500 to-purple-600",
    "gradient-lobby": "from-yellow-400 to-orange-500",
    "gradient-settings": "from-cyan-400 to-blue-500",
  },
  theme: {
    fontFamily: {
      primary: `"Lato",${presetUno()?.theme?.fontFamily?.sans}`,
    },
    fontSize: {
      xs: ["0.67cqw", "1"],
      sm: ["0.78cqw", "1"],
      base: ["1cqw", "1.4cqw"],
      lg: ["1cqw", "1"],
      xl: ["1.11cqw", "1"],
      "2xl": ["1.33cqw", "1"],
      "3xl": ["1.67cqw", "1.2"],
      "4xl": ["2cqw", "1.2"],
      "5xl": ["2.67cqw", "1.2"],
      "6xl": ["3.33cqw", "1.2"],
      "7xl": ["4cqw", "1.2"],
      "8xl": ["5.33cqw", "1.2"],
      "9xl": ["7.33cqw", "1.2"],
    },
    borderRadius: {
      sm: "0.125cqw",
      DEFAULT: "0.25cqw",
      md: "0.375cqw",
      lg: "0.5cqw",
      xl: "0.75cqw",
      "2xl": "1cqw",
      "3xl": "1.5cqw",
    },
    colors: {
      tester: generateColorObject("teal"),
      cyan: generateColorObject("cyan"),
      blue: generateColorObject("blue"),
      green: generateColorObject("green"),
      teal: generateColorObject("teal"),
      pink: generateColorObject("pink"),
      purple: generateColorObject("purple"),
      yellow: generateColorObject("yellow"),
      orange: generateColorObject("orange"),
      error: "#F3696E",
      success: "#4ade80",
      warning: "#fbbf24",
      info: "#60a5fa",
    },
  },
});

function generateColorObject(colorName: string) {
  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  const colorObject: Record<string, string> = {};

  for (const shade of shades) {
    colorObject[`${shade}`] = `rgb(var(--${colorName}-${shade}))`;
  }

  return colorObject;
}
