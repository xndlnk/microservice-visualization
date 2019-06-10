import { Module } from '@nestjs/common'

import { RabbitMqManagementApiService } from './api/api.service'
import { ConfigModule } from '../../config/config.module'
import { ExchangesFromApiProducer } from './transformer/ExchangesFromApiProducer'
import { ExchangesFromEnvVarsProducer } from './transformer/ExchangesFromEnvVarsProducer'
import { ExchangesFromSourceCodeProducer } from './transformer/ExchangesFromSourceCodeProducer'
import { MicroserviceWithMessageExchangeMerger } from './transformer/MicroserviceWithMessageExchangeMerger'

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
    MicroserviceWithMessageExchangeMerger
  ],
  exports: [
    RabbitMqManagementApiService,
    ExchangesFromApiProducer,
    ExchangesFromEnvVarsProducer,
    ExchangesFromSourceCodeProducer,
    MicroserviceWithMessageExchangeMerger
  ]
})
class RabbitMqModule { }

export {
  RabbitMqModule,
  RabbitMqManagementApiService,
  ExchangesFromApiProducer,
  ExchangesFromEnvVarsProducer,
  ExchangesFromSourceCodeProducer,
  MicroserviceWithMessageExchangeMerger
}
