import { Module } from '@nestjs/common'

import { KubernetesApiService } from './api/api.service'
import { ConfigModule } from '../../config/config.module'
import { EnvVarsFromPodsDecorator } from './transformer/EnvVarsFromPodsDecorator'
import { LabelsFromDeploymentsDecorator } from './transformer/LabelsFromDeploymentsDecorator'
import { MicroservicesFromServicesProducer } from './transformer/MicroservicesFromServicesProducer'
import { KubernetesCollectorService } from './collector/KubernetesCollector.service'

@Module({
  imports: [
    ConfigModule
  ],
  controllers: [
  ],
  providers: [
    KubernetesApiService,
    EnvVarsFromPodsDecorator,
    LabelsFromDeploymentsDecorator,
    MicroservicesFromServicesProducer,
    KubernetesCollectorService
  ],
  exports: [
    KubernetesApiService,
    EnvVarsFromPodsDecorator,
    LabelsFromDeploymentsDecorator,
    MicroservicesFromServicesProducer,
    KubernetesCollectorService
  ]
})
class KubernetesModule { }

export {
  KubernetesModule,
  KubernetesApiService,
  EnvVarsFromPodsDecorator,
  LabelsFromDeploymentsDecorator,
  MicroservicesFromServicesProducer,
  KubernetesCollectorService
}
