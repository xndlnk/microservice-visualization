import { Module } from '@nestjs/common'

import {
  ConfigModule, SourceCodeAnalysisModule, DefaultCollectorService, CollectorController,
  SourcePatternDslModule
} from 'tadis-analyzer'

import { MySourceOnlyCollectorService } from './MySourceOnlyCollector.service'
import { AnalyzerForEventProcessor } from './AnalyzerForEventProcessor'

const customCollectorProvider = {
  provide: DefaultCollectorService,
  useClass: MySourceOnlyCollectorService
}

@Module({
  imports: [
    ConfigModule,
    SourceCodeAnalysisModule,
    SourcePatternDslModule
  ],
  controllers: [
    CollectorController
  ],
  providers: [
    customCollectorProvider,
    AnalyzerForEventProcessor
  ],
  exports: [
  ]
})
export class MySourceOnlyCollectorModule { }
