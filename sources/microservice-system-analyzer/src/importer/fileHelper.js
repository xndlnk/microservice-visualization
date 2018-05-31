const log = require('npmlog')
const fs = require('fs')

/** returns an array of java files found in the given path with their full paths */
async function findJavaFiles (path) {
  let files = []
  await getFilesRecursive(path, files, '.java')
  return files
}

async function getFilesRecursive (path, allFiles, fileEnding) {
  let entries = await readdirPromised(path)

  for (const entry of entries) {
    let entryWithPath = path + '/' + entry
    if (!fileEnding || entry.endsWith(fileEnding)) {
      allFiles.push(entryWithPath)
    }

    if (fs.statSync(entryWithPath).isDirectory()) {
      await getFilesRecursive(entryWithPath, allFiles, fileEnding)
    }
  }

  return true
}

function readdirPromised (path) {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (error, files) => {
      if (error) {
        log.error('file-helper', 'error occured: ' + error)
        reject(error)
      } else {
        resolve(files)
      }
    })
  })
}

function getServiceNameFromPath (path, file) {
  const strippedPath = file.slice(path.length + 1)
  const serviceName = strippedPath.slice(0, strippedPath.indexOf('/'))
  return serviceName
}

module.exports = {
  findJavaFiles,
  getServiceNameFromPath
}
