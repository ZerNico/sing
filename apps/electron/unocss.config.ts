import {
  defineConfig,
  presetAttributify,
  presetUno,
} from 'unocss'

import transformerVariantGroup from '@unocss/transformer-variant-group'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
  ],
  transformers: [
    transformerVariantGroup(),
  ],
  rules: [
    ['gradient-bg-main', { background: 'radial-gradient(at 60% top,rgba(30, 36, 75, 1) 0%,rgba(16, 16, 36, 1) 100%)' }],
  ],
})
