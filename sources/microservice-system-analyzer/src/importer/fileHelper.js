const log = require('npmlog')
const fs = require('fs')

/** returns an array of java files found in the given path with their full paths. */
async function findFiles (path, fileEnding) {
  const files = []
  await getFilesRecursive(path, files, fileEnding)
  return files
}

async function getFilesRecursive (path, allFiles, fileEnding) {
  const entries = await readdirPromised(path)

  for (const entry of entries) {
    const entryWithPath = path + '/' + entry
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

/** extracts the service name of a file in the source path.
 * the service name will be the name of the folder that is directly contained in the source path.
 */
function getServiceNameFromPath (sourcePath, file) {
  const strippedPath = file.slice(sourcePath.length + 1)
  const serviceName = strippedPath.slice(0, strippedPath.indexOf('/'))
  return serviceName
}

module.exports = {
  findFiles,
  getServiceNameFromPath
}
