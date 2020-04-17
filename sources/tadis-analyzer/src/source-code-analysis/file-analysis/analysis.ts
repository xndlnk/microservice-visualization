import * as fs from 'fs'
import * as p from 'path'

/**
 * searches for all files in the given path recursively
 * and filters for given file ending.
 *
 * @param path
 * @param fileEnding
 */
export async function findFiles(path: string, fileEnding: string) {
  const files: string[] = []
  await getFilesRecursive(path, files, fileEnding)
  return files
}

/**
 * searches for all files in the given path recursively
 * and filters for given file ending.
 * ignores files which belong to the source of this software
 * iff the software is not invoked from a unit test.
 *
 * @param path
 * @param fileEnding
 */
export async function findFilesSafe(path: string, fileEnding: string): Promise<string[]> {
  const allFiles = await findFiles(path, fileEnding)
  return allFiles.filter(file => isNoSourceOfThisProject(file))
}

async function getFilesRecursive(path, allFiles, fileEnding) {
  const entries = await getDirectoryEntries(path)

  for (const entry of entries) {
    const entryWithPath = p.resolve(path, entry)
    if (!fs.statSync(entryWithPath).isDirectory()
      && (!fileEnding || entry.endsWith(fileEnding))) {
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

/**
 * returns true if either the given file does not belong to this software
 * or this method was called from a unit test.
 *
 * @param file
 * @deprecated use findFilesSafe() instead
 */
export function isNoSourceOfThisProject(file) {
  const thisProjectsSourceFolder = p.resolve(process.cwd(), 'src')
  return !file.toLowerCase().includes(thisProjectsSourceFolder.toLowerCase()) || process.env.NODE_ENV === 'test'
}
