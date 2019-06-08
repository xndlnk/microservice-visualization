import { Module } from '@nestjs/common'

import { ConfigModule } from '../../config/config.module'
import { SourceCodeAnalysisModule } from '../../source-code-analysis/SourceCodeAnalysis.module'
import { SubSystemTransformerService } from './SubSystemTransformer'

@Module({
  imports: [
    ConfigModule,
    SourceCodeAnalysisModule
  ],
  providers: [
    SubSystemTransformerService
  ],
  exports: [
    SubSystemTransformerService
  ]
})
class MsaCommonModule { }

export {
  MsaCommonModule, SubSystemTransformerService
}
