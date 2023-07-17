/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

type ImportMetaEnvAugmented = import('@julr/vite-plugin-validate-env').ImportMetaEnvAugmented<
  typeof import('../env').default
>

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ImportMetaEnv extends ImportMetaEnvAugmented {}

declare const __APP_VERSION__: string
