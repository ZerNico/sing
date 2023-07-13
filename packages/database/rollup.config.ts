import typescript from '@rollup/plugin-typescript'
import { defineConfig } from 'rollup'

export default defineConfig([
  {
    input: 'src/index.ts',
    output: [
      {
        dir: 'dist',
        format: 'esm',
        preserveModules: true,
        entryFileNames: '[name].mjs',
      },
      {
        dir: 'dist',
        format: 'cjs',
        preserveModules: true,
        entryFileNames: '[name].js',
      },
    ],
    treeshake: true,
    plugins: [typescript()],
    external: ['drizzle-orm', 'drizzle-orm/postgres-js', 'drizzle-orm/postgres-js/migrator', 'drizzle-orm/pg-core'],
  },
])
