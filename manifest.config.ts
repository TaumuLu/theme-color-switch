import { type ConfigEnv } from 'vite'
import { defineManifest } from '@crxjs/vite-plugin'
import packageJson from './package.json'
import manifestJson from './manifest.json'
// eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error, @typescript-eslint/ban-ts-comment
// @ts-ignore
import { defaultHosts, getMatches, icons } from './src/constant/config'

const { version } = packageJson

// Convert from Semver (example: 0.1.0-beta6)
const [major, minor, patch, label = '0'] = version
  // can only contain digits, dots, or dash
  .replace(/[^\d.-]+/g, '')
  // split into version parts
  .split(/[.-]/)

export default defineManifest(async (env: ConfigEnv) => {
  const isDev = env.mode !== 'production'
  const { name } = manifestJson

  return {
    ...manifestJson,
    name: isDev ? `![DEV] ${name}` : name,
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
    host_permissions: [...getMatches(defaultHosts)],
    optional_host_permissions: ['<all_urls>'],
    content_scripts: [
      // {
      //   js: ['src/contents/preload.ts'],
      //   matches: ['<all_urls>'],
      //   run_at: 'document_start',
      // },
      // {
      //   js: ['src/contents/index.ts'],
      //   matches: ['<all_urls>'],
      //   run_at: 'document_end',
      // },
      {
        js: ['src/contents/preload.ts', 'src/contents/switch.ts'],
        matches: ['http://www.baidu.com/'],
        run_at: 'document_start',
      },
    ].filter(Boolean),
  }
})
