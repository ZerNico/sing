import { defineConfig, presetAttributify, presetUno } from 'unocss'
import presetIcons from '@unocss/preset-icons'

import transformerDirectives from '@unocss/transformer-directives'
import transformerVariantGroup from '@unocss/transformer-variant-group'

export default defineConfig({
  presets: [presetUno(), presetAttributify(), presetIcons()],
  transformers: [transformerVariantGroup(), transformerDirectives()],
  rules: [
    ['gradient-bg-main', { background: 'radial-gradient(at 60% top,rgba(30, 36, 75, 1) 0%,rgba(16, 16, 36, 1) 100%)' }],
    ['gradient-bg-secondary', { background: 'radial-gradient(at top, #2d3438 0%, #203141 100%)' }],
  ],
  theme: {
    fontFamily: {
      primary: `"Open Sans",${presetUno()?.theme?.fontFamily?.sans}`,
    },
    colors: {
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      muted: 'hsl(var(--muted))',
      mutedForeground: 'hsl(var(--muted-foreground))',
      accent: 'hsl(var(--accent))',
      accentForeground: 'hsl(var(--accent-foreground))',
      popover: 'hsl(var(--popover))',
      popoverForeground: 'hsl(var(--popover-foreground))',
      border: 'hsl(var(--border))',
      input: 'hsl(var(--input))',
      card: 'hsl(var(--card))',
      cardForeground: 'hsl(var(--card-foreground))',
      primary: 'hsl(var(--primary))',
      primaryForeground: 'hsl(var(--primary-foreground))',
      secondary: 'hsl(var(--secondary))',
      secondaryForeground: 'hsl(var(--secondary-foreground))',
      destructive: 'hsl(var(--destructive))',
      destructiveForeground: 'hsl(var(--destructive-foreground))',
      ring: 'hsl(var(--ring))',
    },
    borderRadius: {
      lg: 'var(--radius)',
      md: 'calc(var(--radius) - 2px)',
      sm: 'calc(var(--radius) - 4px)',
    },
  },
})
