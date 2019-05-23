import { Injectable, Logger } from '@nestjs/common'

import { ConfigService } from '../../config/config.service'
import { GitStorage } from './GitStorage'

@Injectable()
export class GitStorageService {
  public readonly gitStorage: GitStorage

  constructor(private config: ConfigService) {
    this.gitStorage = new GitStorage(config.getSourceFolder(), config.getGitBaseUrls())
  }
}
