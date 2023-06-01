import { defineManifest } from '@crxjs/vite-plugin'
import packageJson from './package.json'
import manifestJson from './manifest.json'
const { version } = packageJson

// Convert from Semver (example: 0.1.0-beta6)
const [major, minor, patch, label = '0'] = version
  // can only contain digits, dots, or dash
  .replace(/[^\d.-]+/g, '')
  // split into version parts
  .split(/[.-]/)

const name = packageJson.name
  .split('-')
  .map(str => str.charAt(0).toUpperCase() + str.slice(1))
  .join(' ')

export default defineManifest(async env => {
  return {
    ...manifestJson,
    name: env.mode !== 'production' ? `![DEV] ${name}` : name,
    // up to four numbers separated by dots
    version: `${major}.${minor}.${patch}.${label}`,
    // semver is OK in "version_name"
    version_name: version,
  }
})
