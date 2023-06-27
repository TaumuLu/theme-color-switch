const fs = require('fs')
const path = require('path')
const jsonPath = path.resolve(__dirname, '../dist/manifest.json')

if (fs.existsSync(jsonPath)) {
  const manifest = fs.readFileSync(jsonPath, 'utf8')
  const jsonData = JSON.parse(manifest)
  // 修复 manifest 配置
  jsonData.web_accessible_resources = [jsonData.web_accessible_resources[0]]

  fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2))
}
