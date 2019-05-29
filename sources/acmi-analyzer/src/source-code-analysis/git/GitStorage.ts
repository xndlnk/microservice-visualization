import { Logger } from '@nestjs/common'

import * as cp from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'
import * as rimraf from 'rimraf'

export type StorageStatus = {
  name: string,
  lastModified: Date
}

export class GitStorage {
  private readonly logger = new Logger(GitStorage.name)

  private readonly childProcessOptions = {
    cwd: process.cwd(),
    env: process.env,
    stdio: [process.stdin, process.stdout, process.stderr],
    encoding: 'utf-8'
  }

  constructor(private sourceFolder: string, private gitBaseUrls: string[]) { }

  // TODO: improve error handling when ssh key is missing or not authorized
  async storeRepository(repositoryName: string): Promise<string | undefined> {
    for (const baseUrl of this.gitBaseUrls) {
      const url = baseUrl + '/' + repositoryName
      // TODO: log warning if repositoryName could not be cloned from any url
      const localPath = await this.storeRepositoryFromUrl(repositoryName, url)
      if (localPath) {
        return localPath
      }
    }
  }

  clearRepository(directoryName: string) {
    rimraf.sync(this.getLocalPath(directoryName))
  }

  async getStorageStatus(): Promise<StorageStatus[]> {
    const readdir = promisify(fs.readdir)
    const repositories = await readdir(this.sourceFolder)

    const repositoriesStatus = repositories.map(async repository => {
      const stat = promisify(fs.stat)
      const stats = await stat(this.sourceFolder + '/' + repository)
      return {
        name: repository,
        lastModified: stats.mtime
      }
    })

    return Promise.all(repositoriesStatus)
  }

  private async storeRepositoryFromUrl(repositoryName: string, repositoryUrl: string): Promise<string | undefined> {
    this.logger.log('storing repository ' + repositoryName + ' from url ' + repositoryUrl)
    const valid = await this.isRepositoryValid(repositoryUrl)
    if (!valid) {
      this.logger.log('skipping invalid repository ' + repositoryUrl)
      return undefined
    }

    if (this.isCloned(repositoryName)) {
      return this.updateRepository(repositoryName)
    } else {
      return this.cloneRepository(repositoryName, repositoryUrl)
    }
  }

  private async isRepositoryValid(repositoryUrl: string): Promise<boolean> {
    const child = cp.spawn('git', ['ls-remote', repositoryUrl], this.childProcessOptions)

    const exitCode = await this.getChildExitCode(child)
    return exitCode === 0
  }

  private isCloned(repositoryName: string): boolean {
    return fs.existsSync(this.getGitPath(repositoryName))
  }

  private getGitPath(repositoryName: string): string {
    return path.resolve(this.getLocalPath(repositoryName), '.git')
  }

  private getLocalPath(repositoryName: string): string {
    return path.resolve(this.sourceFolder, repositoryName)
  }

  private async updateRepository(repositoryName: string): Promise<string | undefined> {
    this.logger.log('pulling ' + repositoryName)

    const gitPath = this.getGitPath(repositoryName)
    const localPath = this.getLocalPath(repositoryName)

    const child = cp.spawn('git', [
      '--git-dir=' + gitPath,
      '--work-tree=' + localPath,
      'pull'
    ], this.childProcessOptions)

    const exitCode = await this.getChildExitCode(child)
    if (exitCode === 0) {
      return localPath
    } else {
      this.logger.error('failed to pull repository ', repositoryName)
      return undefined
    }
  }

  private async cloneRepository(repositoryName: string, repositoryUrl: string): Promise<string | undefined> {
    // INFO: using sync calls in an async call stack is an anti-pattern because it blocks the event processing loop.
    if (!fs.existsSync(this.sourceFolder)) {
      fs.mkdirSync(this.sourceFolder)
    }

    const localPath = this.getLocalPath(repositoryName)
    if (!fs.existsSync(localPath)) {
      fs.mkdirSync(localPath)
    }

    this.logger.log('cloning repository ' + repositoryUrl)

    const child = cp.spawn('git', [
      'clone',
      '--depth', '1', repositoryUrl, localPath
    ], this.childProcessOptions)

    const exitCode = await this.getChildExitCode(child)
    if (exitCode === 0) {
      return localPath
    } else {
      this.logger.error('failed to clone repository from url ' + repositoryUrl)
      return undefined
    }
  }

  private async getChildExitCode(child: cp.ChildProcess): Promise<number> {
    return new Promise<number>(
      (resolve) => {
        child.on('exit', (code) => resolve(code))
      })
  }

}
