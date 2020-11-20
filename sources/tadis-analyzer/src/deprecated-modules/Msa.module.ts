import { Module } from '@nestjs/common'

import { ConfigModule } from '../config/Config.module'
import { CommonTransformersModule } from './CommonTransformers.module'
import { KubernetesModule } from '../system-element-extractors/kubernetes/Kubernetes.module'
import { RabbitMqModule } from '../system-element-extractors/rabbitmq/RabbitMq.module'
import { SystemAssemblerController } from '../system-assemblers/controllers/SystemAssembler.controller'
import { KubernetesRabbitMqAssembler } from '../system-assemblers/kubernetes-rabbitmq/KubernetesRabbitMqAssembler.service'
import { FeignClientAnnotationAnalyzer } from '../system-element-extractors/spring-boot/FeignClientAnnotationAnalyzer'
import { SourceCodeAnalysisModule } from './SourceCodeAnalysis.module'
import { SystemAssembler } from '../system-assemblers/controllers/SystemAssembler.service'
import { ISystemAssembler } from '../system-assemblers/controllers/ISystemAssembler'

type CollectorController = SystemAssemblerController
type Collector = ISystemAssembler
type DefaultCollectorService = SystemAssembler

@Module({
  imports: [
    ConfigModule,
    CommonTransformersModule,
    SourceCodeAnalysisModule,
    KubernetesModule,
    RabbitMqModule
  ],
  controllers: [SystemAssemblerController],
  providers: [
    FeignClientAnnotationAnalyzer,
    KubernetesRabbitMqAssembler,
    {
      provide: SystemAssembler,
      useClass: KubernetesRabbitMqAssembler
    }
  ],
  exports: [
    KubernetesModule,
    RabbitMqModule,
    FeignClientAnnotationAnalyzer,
    SystemAssembler,
    KubernetesRabbitMqAssembler
  ]
})
/**
 * @deprecated use KubernetesModule, RabbitMqModule, SpringBootModule
 */
class MsaModule {}

export {
  MsaModule,
  KubernetesModule,
  RabbitMqModule,
  FeignClientAnnotationAnalyzer,
  SystemAssembler,
  KubernetesRabbitMqAssembler,
  SystemAssemblerController,
  ISystemAssembler,
  CollectorController,
  Collector,
  DefaultCollectorService
}
