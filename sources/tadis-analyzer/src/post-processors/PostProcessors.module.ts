import { Module } from '@nestjs/common'

import { ConfigModule } from '../config/Config.module'
import { StaticNodeFilter } from './StaticNodeFilter'
import { SubSystemFromPayloadTransformer } from './SubSystemFromPayloadTransformer'
import { MicroserviceWithOutgoingExchangeMerger } from './MicroserviceWithOutgoingExchangeMerger'

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [
    StaticNodeFilter,
    SubSystemFromPayloadTransformer,
    MicroserviceWithOutgoingExchangeMerger
  ],
  exports: [
    StaticNodeFilter,
    SubSystemFromPayloadTransformer,
    MicroserviceWithOutgoingExchangeMerger
  ]
})
class PostProcessorsModule {}

export {
  PostProcessorsModule,
  StaticNodeFilter,
  SubSystemFromPayloadTransformer,
  MicroserviceWithOutgoingExchangeMerger
}
