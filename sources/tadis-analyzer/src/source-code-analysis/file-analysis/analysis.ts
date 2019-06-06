import * as fs from 'fs'
import * as p from 'path'

/** returns an array of java files found in the given path with their full paths. */
export async function findFiles(path, fileEnding) {
  const files = []
  await getFilesRecursive(path, files, fileEnding)
  return files
}

async function getFilesRecursive(path, allFiles, fileEnding) {
  const entries = await getDirectoryEntries(path)

  for (const entry of entries) {
    const entryWithPath = p.resolve(path, entry)
    if (!fileEnding || entry.endsWith(fileEnding)) {
      allFiles.push(entryWithPath)
    }

    if (fs.statSync(entryWithPath).isDirectory()) {
      await getFilesRecursive(entryWithPath, allFiles, fileEnding)
    }
  }

  return true
}

function getDirectoryEntries(path): Promise<string[]> {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (error, files) => {
      if (error) {
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
export function getServiceNameFromPath(sourcePath, file) {
  const strippedPath = file.slice(sourcePath.length + 1)
  const serviceName = strippedPath.slice(0, strippedPath.indexOf('/'))
  return serviceName
}

// TODO: instead of requiring each source analysis step to call this method, maybe its better to encapsulate access
// to all stored source files in a service class.
export function isNoSourceOfThisProject(file) {
  const thisProjectsSourceFolder = p.resolve(process.cwd(), 'src')
  return !file.toLowerCase().includes(thisProjectsSourceFolder.toLowerCase()) || process.env.NODE_ENV === 'test'
}
