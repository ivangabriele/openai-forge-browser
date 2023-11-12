import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import { defineConfig } from 'rollup'
import copy from 'rollup-plugin-copy'
import postcss from 'rollup-plugin-postcss'
import { swc } from 'rollup-plugin-swc3'

/**
 * @type {import('rollup').RollupOptions['plugins']}
 */
const commonPlugins = [
  commonjs(),
  resolve({
    preferBuiltins: true,
  }),
  swc({
    sourceMaps: true,
    tsconfig: './tsconfig.json',
  }),
]

// eslint-disable-next-line import/no-default-export
export default defineConfig([
  // ---------------------------------------------------------------------------
  // Chrome (& Brave)

  {
    input: './background/index.ts',

    output: {
      file: './dist/chrome/background.js',
      format: 'esm',
      sourcemap: true,
    },

    plugins: [...commonPlugins],
  },
  {
    input: './content/index.ts',

    output: {
      file: './dist/chrome/content.js',
      format: 'iife',
      sourcemap: true,
    },

    plugins: [
      postcss({
        inject: true,
      }),
      ...commonPlugins,
    ],
  },
  {
    input: './popup/index.ts',

    output: {
      file: './dist/chrome/popup.js',
      format: 'esm',
      sourcemap: true,
    },

    plugins: [...commonPlugins],
  },
  {
    input: './scripts/dummy.js',

    output: {
      file: './dist/dummy.js',
    },

    plugins: [
      copy({
        targets: [
          // Chrome
          { dest: './dist/chrome/assets', src: './assets/icons' },
          { dest: './dist/chrome/assets', src: './assets/icon.svg' },
          { dest: './dist/chrome/assets', src: './assets/icon-dark.svg' },
          { dest: './dist/chrome', rename: 'content.css', src: './content/index.css' },
          { dest: './dist/chrome', rename: 'popup.css', src: './popup/index.css' },
          { dest: './dist/chrome', rename: 'popup.html', src: './popup/index.html' },
          { dest: './dist/chrome', rename: 'manifest.json', src: './manifest.chrome.json' },

          // Firefox
          { dest: './dist', rename: 'firefox', src: './dist/chrome' },
          { dest: './dist/firefox', rename: 'manifest.json', src: './manifest.firefox.json' },
        ],
      }),
    ],
  },
])
