import { Module } from '@nestjs/common'

import { ConfigModule } from '../config/Config.module'
import { StaticNodeFilter } from './StaticNodeFilter'
import { SubSystemFromPayloadTransformer } from './SubSystemFromPayloadTransformer'

@Module({
  imports: [
    ConfigModule
  ],
  controllers: [],
  providers: [
    StaticNodeFilter,
    SubSystemFromPayloadTransformer
  ],
  exports: [
    StaticNodeFilter,
    SubSystemFromPayloadTransformer
  ]
})
class CommonTransformersModule { }

export {
  CommonTransformersModule,
  StaticNodeFilter,
  SubSystemFromPayloadTransformer
}
