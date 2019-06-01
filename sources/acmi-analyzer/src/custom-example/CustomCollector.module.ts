import { Module } from '@nestjs/common'

import { CollectorService } from '../collector/Collector.service'
import { CollectorController } from '../collector/Collector.controller'
import { ConfigModule } from '../config/config.module'
import { SourceCodeAnalysisModule } from '../source-code-analysis/SourceCodeAnalysis.module'
import { TransformerModule } from '../collector/transformer.module'

import { CustomCollectorService } from './CustomCollector.service'

const customCollectorProvider = {
  provide: CollectorService,
  useClass: CustomCollectorService
}

@Module({
  imports: [
    ConfigModule,
    SourceCodeAnalysisModule,
    TransformerModule
  ],
  controllers: [
    CollectorController
  ],
  providers: [
    customCollectorProvider
  ],
  exports: [
  ]
})
export class CustomCollectorModule { }
