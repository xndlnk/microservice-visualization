import * as data from './model'

interface NamePattern extends data.NamePattern {
  resolveNameFromId(id: string, filePath: string, allFiles: string[]): string
}
