import { Module } from '@nestjs/common'
import { CollectorService, ConfigModule, CollectorController, SourceCodeAnalysisModule } from 'acmi-analyzer'

import { CustomCollectorService } from './CustomCollector.service'

const customCollectorProvider = {
  provide: CollectorService,
  useClass: CustomCollectorService
}

@Module({
  imports: [
    ConfigModule,
    SourceCodeAnalysisModule
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
