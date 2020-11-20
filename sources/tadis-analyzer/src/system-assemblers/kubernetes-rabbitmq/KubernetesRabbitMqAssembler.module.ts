import { Module } from '@nestjs/common'

import { ConfigModule } from '../../config/Config.module'
import { KubernetesModule } from '../../system-element-extractors/kubernetes/Kubernetes.module'
import { RabbitMqModule } from '../../system-element-extractors/rabbitmq/RabbitMq.module'
import { SystemAssemblerController } from '../controllers/SystemAssembler.controller'
import { KubernetesRabbitMqAssembler } from './KubernetesRabbitMqAssembler.service'
import { GitModule } from '../../git/Git.module'
import { SystemAssembler } from '../controllers/SystemAssembler.service'
import { SpringBootModule } from '../../system-element-extractors/spring-boot/SpringBoot.module'

@Module({
  imports: [
    ConfigModule,
    GitModule,
    KubernetesModule,
    RabbitMqModule,
    SpringBootModule
  ],
  controllers: [SystemAssemblerController],
  providers: [
    KubernetesRabbitMqAssembler,
    {
      provide: SystemAssembler,
      useClass: KubernetesRabbitMqAssembler
    }
  ],
  exports: [KubernetesRabbitMqAssembler]
})
class KubernetesRabbitMqAssemblerModule {}

export { KubernetesRabbitMqAssemblerModule, KubernetesRabbitMqAssembler }
