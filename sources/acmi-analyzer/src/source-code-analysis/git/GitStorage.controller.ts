import { Get, Controller, Logger, Param, Req, Query } from '@nestjs/common'
import { GitStorageService } from './GitStorage.service'
import { GitStorage, StorageStatus } from './GitStorage'

@Controller('source')
export class GitStorageController {
  private readonly sourceStorage: GitStorage

  constructor(
    private readonly sourceStorageService: GitStorageService
  ) {
    this.sourceStorage = sourceStorageService.gitStorage
  }

  // parallel request to the same endpoint will be handled one after the other, i.e. sequentially.
  // in contrast, requests to different endpoints are handled in parallel.

  @Get('status')
  async getStorageStatus(): Promise<StorageStatus[]> {
    return this.sourceStorage.getStorageStatus()
  }

  @Get('store/repository/:repositoryName')
  async storeRepositoryAsync(
    @Param('repositoryName') repositoryName: string,
    @Query('sync') sync: string
  ): Promise<string> {
    if (sync !== undefined) {
      return this.storeRepositorySync(repositoryName)
    }

    this.sourceStorage.storeRepository(repositoryName)
    return 'started storing in background ...'
  }

  private async storeRepositorySync(repositoryName: string): Promise<string> {
    const localPath = await this.sourceStorage.storeRepository(repositoryName)
    if (!localPath) {
      return 'storing failed!'
    }

    return 'stored to local path ' + localPath
  }

}
