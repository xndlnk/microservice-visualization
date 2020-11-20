import { Module } from '@nestjs/common'

import { ConfigModule } from '../config/Config.module'
import { GitStorageController } from '../git/GitStorage.controller'
import { GitStorageService } from '../git/GitStorage.service'
import { SourceLocationDecorator } from '../git/SourceLocationDecorator'
import * as fileAnalysis from '../utils/files/analysis'

@Module({
  imports: [ConfigModule],
  controllers: [GitStorageController],
  providers: [GitStorageService, SourceLocationDecorator],
  exports: [GitStorageService, SourceLocationDecorator]
})
/**
 * @deprecated use GitModule and fileAnalysis
 */
class SourceCodeAnalysisModule {}

export {
  SourceCodeAnalysisModule,
  GitStorageService,
  SourceLocationDecorator,
  fileAnalysis
}
