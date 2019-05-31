import { Module } from '@nestjs/common'

// TODO: make import/provider for steps dynamic and load them from a config.
// see bottom in https://github.com/nestjs/nest/issues/450
import { CollectorService } from './Collector.service'
import { CollectorController } from './Collector.controller'
import { FeignClientsFromSourceCodeProducer } from './feign/FeignClientsFromSourceCodeProducer'
import { ExcludedNodesRemover } from './generic-transformer/ExcludedNodesRemover'
import { CabinetTransformer } from './generic-transformer/CabinetTransformer'
import { MicroserviceWithMessageExchangeMerger } from './generic-transformer/MicroserviceWithMessageExchangeMerger'
import { ConfigModule } from '../config/config.module'
import { KubernetesModule } from '../kubernetes/kubernetes.module'
import { RabbitMqModule } from '../rabbitmq/rabbitmq.module'
import { SourceCodeAnalysisModule } from '../source-code-analysis/SourceCodeAnalysis.module'
import { AnnotationAnalyzer } from './java-source/AnnotationAnalyzer.service'

@Module({
  imports: [
    ConfigModule,
    KubernetesModule,
    RabbitMqModule,
    SourceCodeAnalysisModule
  ],
  controllers: [
    CollectorController
  ],
  providers: [
    CollectorService,
    ExcludedNodesRemover,
    FeignClientsFromSourceCodeProducer,
    AnnotationAnalyzer,
    // INFO: actually this is no collector. we keep here for compatibility reasons
    // but it might be removed in the future.
    CabinetTransformer,
    MicroserviceWithMessageExchangeMerger
  ],
  exports: [
    CollectorService
  ]
})
export class CollectorModule { }
