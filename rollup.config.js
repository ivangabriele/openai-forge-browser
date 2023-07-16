import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import { defineConfig } from 'rollup'
import copy from 'rollup-plugin-copy'
import postcss from 'rollup-plugin-postcss'
import { swc } from 'rollup-plugin-swc3'

// eslint-disable-next-line import/no-default-export
export default defineConfig([
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
    input: './popup/index.ts',

    output: {
      file: './dist/popup.js',
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
      copy({
        targets: [
          { dest: './dist', src: './manifest.json' },
          { dest: './dist/assets', src: './assets/icons' },
          { dest: './dist', rename: 'popup.html', src: './popup/index.html' },
        ],
      }),
    ],
  },
  {
    input: './worker/index.ts',

    output: {
      file: './dist/worker.js',
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
