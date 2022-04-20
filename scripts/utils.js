const path = require('path')
const fs = require('fs')
const promisify = require('util').promisify

const _readJSON = async (name) => {
  const file = (await promisify(fs.readFile)(name)).toString()
  return JSON.parse(file)
}
const _writeJSON = async (name, json) => {
  const data = JSON.stringify(json, null, 2)
  await promisify(fs.writeFile)(name, data)
}

const packages = async (dir = path.resolve(__dirname, '../package.json')) => {
  const dirents = await promisify(fs.readdir)(dir, { withFileTypes: true })
  const packages = []

  for (const dirent of dirents) {
    if (!dirent.isDirectory()) return
    try {
      const jsonPath = path.resolve(dir, dirent.name, 'package.json')
      const packageJson = await _readJSON(jsonPath)
      const { name } = packageJson

      packages.push({
        name,
        path: path.resolve(dir, dirent.name),
        packageJson,
        async update() {
          await _writeJSON(jsonPath, this.packageJson)
        },
      })
    } catch (e) {
      // eslint-disable-next-line
      console.error(e)
      continue
    }
  }
}

const workspace = () => _readJSON(path.resolve(__dirname, '../package.json'))
const updateWorkspace = (jsonData) => _writeJSON(path.resolve(__dirname, '../package.json'), jsonData)

module.exports = {
  packages,
  workspace,
  updateWorkspace,
}
