import { Module } from '@nestjs/common'

import { ConfigModule } from '../config/config.module'
import { GitStorageController } from './git/GitStorage.controller'
import { GitStorageService } from './git/GitStorage.service'
import { SourceLocationDecorator } from './git/SourceLocationDecorator.service'
import * as fileAnalysis from './file-analysis/analysis'

@Module({
  imports: [
    ConfigModule
  ],
  controllers: [
    GitStorageController
  ],
  providers: [
    GitStorageService,
    SourceLocationDecorator
  ],
  exports: [
    GitStorageService,
    SourceLocationDecorator
  ]
})
class SourceCodeAnalysisModule { }

export { SourceCodeAnalysisModule, GitStorageService, SourceLocationDecorator, fileAnalysis }
