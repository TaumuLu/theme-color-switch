import { type ConfigEnv } from 'vite'
import packageJson from './package.json'
import manifestJson from './manifest.json'
import { name, domain, icons } from './src/constant/config'
const { version } = packageJson

// Convert from Semver (example: 0.1.0-beta6)
const [major, minor, patch, label = '0'] = version
  // can only contain digits, dots, or dash
  .replace(/[^\d.-]+/g, '')
  // split into version parts
  .split(/[.-]/)

// const name = packageJson.name
//   .split('-')
//   .map(str => str.charAt(0).toUpperCase() + str.slice(1))
//   .join(' ')

export default async (env: ConfigEnv) => {
  return {
    ...manifestJson,
    name: env.mode !== 'production' ? `![DEV] ${name}` : name,
    // up to four numbers separated by dots
    version: `${major}.${minor}.${patch}.${label}`,
    // semver is OK in "version_name"
    version_name: version,
    icons,
    action: {
      ...manifestJson.action,
      default_icon: icons,
    },
    // optional_permissions: ['activeTab'],
    // host_permissions: ['<all_urls>'],
    host_permissions: [...domain],
    content_scripts: manifestJson.content_scripts.map(item => {
      return {
        ...item,
        matches: [...domain],
      }
    }),
  }
}
