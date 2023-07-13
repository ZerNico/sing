import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { defineConfig } from 'rollup'
import ts from 'rollup-plugin-ts'

export default defineConfig([
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'esm',
    },
    treeshake: true,
    plugins: [nodeResolve(), commonjs(), ts()],
  },
])
