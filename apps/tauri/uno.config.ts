import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'
import { defineConfig, presetIcons, presetUno, transformerDirectives, transformerVariantGroup } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      collections: {
        sing: FileSystemIconLoader('./src/assets/icons/sing'),
      },
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  shortcuts: {
    'outline-md': 'outline-0.2cqw',
  },
  rules: [
    ['gradient-bg-main', { background: 'radial-gradient(at 60% top, #1e244b 0%, #101024 100%)' }],
    ['gradient-bg-secondary', { background: 'radial-gradient(at top, #2d3438 0%, #203141 100%)' }],
    [/^animate-spin-(\d+)$/, ([, d]) => ({ animation: `spin ${d}ms linear infinite` })],
  ],
  theme: {
    fontFamily: {
      primary: `"Open Sans",${presetUno()?.theme?.fontFamily?.sans}`,
    },
    colors: {
      singStart: '#11998e',
      singEnd: '#38ef7d',
      partyStart: '#7420FB',
      partyEnd: '#CF56E3',
      lobbyStart: '#c94b4b',
      lobbyEnd: '#ffc0cb',
      settingsStart: '#36D1DC',
      settingsEnd: '#5B86E5',
      info: '#297fb8',
      success: '#27ae60',
      warning: '#d4b611',
      error: '#c0392b',
      neutral: '#a3a3a3',
    },
    borderRadius: {
      md: '0.4cqw',
      lg: '0.6cqw',
    },
  },
})
