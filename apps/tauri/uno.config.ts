import { defineConfig, presetIcons, presetUno, transformerDirectives, transformerVariantGroup } from 'unocss'

export default defineConfig({
  presets: [presetUno(), presetIcons()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
})
