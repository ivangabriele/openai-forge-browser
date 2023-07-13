import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import { defineConfig } from 'rollup'
import postcss from 'rollup-plugin-postcss'
import { swc } from 'rollup-plugin-swc3'

// eslint-disable-next-line import/no-default-export
export default defineConfig([
  {
    input: './background/index.ts',

    output: {
      file: './dist/background.js',
      format: 'esm',
      sourcemap: true,
    },

    plugins: [
      commonjs(),
      resolve({
        preferBuiltins: true,
      }),
      swc({
        sourceMaps: true,
        tsconfig: './tsconfig.json',
      }),
    ],
  },
  {
    input: './content/index.ts',

    output: {
      file: './dist/content.js',
      format: 'iife',
      sourcemap: true,
    },

    plugins: [
      commonjs(),
      resolve({
        preferBuiltins: true,
      }),
      postcss({
        inject: true,
      }),
      swc({
        sourceMaps: true,
        tsconfig: './tsconfig.json',
      }),
    ],
  },
  {
    input: './foreground/index.ts',

    output: {
      file: './dist/foreground.js',
      format: 'esm',
      sourcemap: true,
    },

    plugins: [
      commonjs(),
      resolve({
        preferBuiltins: true,
      }),
      swc({
        sourceMaps: true,
        tsconfig: './tsconfig.json',
      }),
    ],
  },
])
