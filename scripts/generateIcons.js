/* eslint-disable no-await-in-loop */

import { promises as fs } from 'node:fs'
import { rgb } from 'd3-color'
import sharp from 'sharp'

const originalIconPath = './assets/icon.svg'

// Base icons
const sizes = [16, 32, 48, 128, 512]
// eslint-disable-next-line no-restricted-syntax
for (const size of sizes) {
  const newPngIconPath = `./assets/icons/x${size}.png`
  console.info(`Writing ${newPngIconPath}...`)
  await sharp(originalIconPath)
    .png({
      compressionLevel: 1,
    })
    .resize(size, size)
    .toFile(newPngIconPath)
}

// Animation icons
const originalIconSource = await fs.readFile(originalIconPath, 'utf8')
const fillRegExp = /fill:#([0-9a-f]{6})/i
let index = 0
while (index < 17) {
  const hue = index * 15

  const colorAsRgb = rgb(`hsl(${hue}, 100%, 50%)`)
  const newColor = `fill:${colorAsRgb};`

  const newSvgIconSource = originalIconSource.replace(fillRegExp, newColor)
  const newSvgIconPath = `./assets/icons/a${String(index).padStart(2, '0')}.svg`
  console.info(`Writing ${newSvgIconPath}...`)
  await fs.writeFile(newSvgIconPath, newSvgIconSource)

  const newPngIconPath = newSvgIconPath.replace(/\.svg$/, '.png')
  console.info(`Writing ${newPngIconPath}...`)
  await sharp(newSvgIconPath)
    .png({
      compressionLevel: 1,
    })
    .resize(48, 48)
    .toFile(newPngIconPath)

  index += 1
}
