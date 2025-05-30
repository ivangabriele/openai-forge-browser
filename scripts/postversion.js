import { promises as fs } from 'node:fs'
// Get version for npm version
import { $, execa } from 'execa'

async function readJsonFile(jsonFilePath) {
  const jsonFileSource = await fs.readFile(jsonFilePath, 'utf8')

  return JSON.parse(jsonFileSource)
}

async function writeJsonFile(jsonFilePath, jsonFileSourceAsObject) {
  // eslint-disable-next-line no-null/no-null
  const jsonFileSource = JSON.stringify(jsonFileSourceAsObject, null, 2)

  await fs.writeFile(jsonFilePath, jsonFileSource, 'utf8')
}

const VERSION = process.env.npm_package_version
if (!VERSION) {
  throw new Error('`process.env.npm_package_version` is undefined.')
}

const chromeManifest = await readJsonFile('./manifest.chrome.json')
const firefoxManifest = await readJsonFile('./manifest.firefox.json')
chromeManifest.version = VERSION
firefoxManifest.version = VERSION
await writeJsonFile('./manifest.chrome.json', chromeManifest)
await writeJsonFile('./manifest.firefox.json', firefoxManifest)

const chromeDistPath = `${process.cwd()}/dist/chrome`
const firefoxDistPath = `${process.cwd()}/dist/firefox`
await $`yarn build`
await $({ cwd: chromeDistPath })`zip -r ../../openai-forge-chrome-${VERSION}.zip .`
await $({ cwd: firefoxDistPath })`zip -r ../../openai-forge-firefox-${VERSION}.zip .`

await $`git add .`
await execa('git', ['commit', '--amend', '-m', `ci(release): v${VERSION}`])
await $`git tag -f v${VERSION}`
