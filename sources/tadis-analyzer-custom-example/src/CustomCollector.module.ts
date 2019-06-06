import { Module } from '@nestjs/common'

import {
  CollectorService, ConfigModule, CollectorController, SourceCodeAnalysisModule,
  KubernetesModule, RabbitMqModule, TransformerModule
} from 'tadis-analyzer'

import { CustomCollectorService } from './CustomCollector.service'

const customCollectorProvider = {
  provide: CollectorService,
  useClass: CustomCollectorService
}

@Module({
  imports: [
    ConfigModule,
    KubernetesModule,
    RabbitMqModule,
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
