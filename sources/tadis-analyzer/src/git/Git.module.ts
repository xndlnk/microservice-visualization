import { Module } from '@nestjs/common'

import { ConfigModule } from '../config/Config.module'
import { GitStorageController } from './GitStorage.controller'
import { GitStorageService } from './GitStorage.service'
import { SourceLocationDecorator } from './SourceLocationDecorator'

@Module({
  imports: [ConfigModule],
  controllers: [GitStorageController],
  providers: [GitStorageService, SourceLocationDecorator],
  exports: [GitStorageService, SourceLocationDecorator]
})
class GitModule {}

export { GitModule, GitStorageService, SourceLocationDecorator }
