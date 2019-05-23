import { Module } from '@nestjs/common'

import { ConfigModule } from '../config/config.module'
import { GitStorageController } from './git/GitStorage.controller'
import { GitStorageService } from './git/GitStorage.service'

@Module({
  imports: [
    ConfigModule
  ],
  controllers: [
    GitStorageController
  ],
  providers: [
    GitStorageService
  ],
  exports: [
    GitStorageService
  ]
})
export class SourceCodeAnalysisModule { }
