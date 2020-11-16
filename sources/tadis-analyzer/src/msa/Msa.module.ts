import { Module } from '@nestjs/common'

import { ConfigModule } from '../config/Config.module'
import { CommonTransformersModule } from '../common-transformers/CommonTransformers.module'
import { KubernetesModule } from './kubernetes/Kubernetes.module'
import { RabbitMqModule } from './rabbitmq/RabbitMq.module'
import { CollectorController } from './collector/Collector.controller'
import { KubernetesRabbitMqCollectorService } from './collector/KubernetesRabbitMqCollector'
import { FeignClientAnnotationAnalyzer } from './feign/FeignClientAnnotationAnalyzer'
import { SourceCodeAnalysisModule } from '../source-code-analysis/SourceCodeAnalysis.module'
import { DefaultCollectorService } from './collector/DefaultCollector'
import { Collector } from './collector/Collector'

@Module({
  imports: [
    ConfigModule,
    CommonTransformersModule,
    SourceCodeAnalysisModule,
    KubernetesModule,
    RabbitMqModule
  ],
  controllers: [
    CollectorController
  ],
  providers: [
    FeignClientAnnotationAnalyzer,
    KubernetesRabbitMqCollectorService,
    {
      provide: DefaultCollectorService,
      useClass: KubernetesRabbitMqCollectorService
    }
  ],
  exports: [
    KubernetesModule,
    RabbitMqModule,
    FeignClientAnnotationAnalyzer,
    DefaultCollectorService,
    KubernetesRabbitMqCollectorService
  ]
})
class MsaModule { }

export {
  MsaModule,
  KubernetesModule,
  RabbitMqModule,
  FeignClientAnnotationAnalyzer,
  DefaultCollectorService,
  KubernetesRabbitMqCollectorService,
  CollectorController,
  Collector
}
