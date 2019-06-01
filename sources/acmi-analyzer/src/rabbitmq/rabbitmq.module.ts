import { Module } from '@nestjs/common'

import { RabbitMqManagementApiService } from './api/api.service'
import { ConfigModule } from '../config/config.module'
import { ExchangesFromApiProducer } from './transformer/ExchangesFromApiProducer'
import { ExchangesFromEnvVarsProducer } from './transformer/ExchangesFromEnvVarsProducer'
import { ExchangesFromSourceCodeProducer } from './transformer/ExchangesFromSourceCodeProducer'
import { RabbitMqCollectorService } from './collector/RabbitMqCollector.service'

@Module({
  imports: [
    ConfigModule
  ],
  controllers: [
  ],
  providers: [
    RabbitMqManagementApiService,
    ExchangesFromApiProducer,
    ExchangesFromEnvVarsProducer,
    ExchangesFromSourceCodeProducer,
    RabbitMqCollectorService
  ],
  exports: [
    RabbitMqCollectorService
  ]
})
class RabbitMqModule { }

export { RabbitMqModule, RabbitMqCollectorService }
