import { Module } from '@nestjs/common'

import { CollectorService } from './Collector.service'
import { CollectorController } from './Collector.controller'
import { ConfigModule } from '../config/config.module'
import { KubernetesModule } from '../kubernetes/kubernetes.module'
import { RabbitMqModule } from '../rabbitmq/rabbitmq.module'
import { SourceCodeAnalysisModule } from '../source-code-analysis/SourceCodeAnalysis.module'
import { TransformerModule } from './transformer.module'

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
    CollectorService
  ]
})
export class CollectorModule { }
