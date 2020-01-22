import { Module } from '@nestjs/common'

import { ConfigModule } from '../config/Config.module'
import { StaticNodeFilter } from './StaticNodeFilter'
import {
  AssociatedSubSystemTransformer,
  AssociatedSubSystemTransformer as SubSystemFromPayloadTransformer
} from './SubSystemFromPayloadTransformer'

@Module({
  imports: [
    ConfigModule
  ],
  controllers: [],
  providers: [
    StaticNodeFilter,
    AssociatedSubSystemTransformer,
    SubSystemFromPayloadTransformer
  ],
  exports: [
    StaticNodeFilter,
    AssociatedSubSystemTransformer,
    SubSystemFromPayloadTransformer
  ]
})
class CommonTransformersModule { }

export {
  CommonTransformersModule,
  StaticNodeFilter,
  AssociatedSubSystemTransformer,
  SubSystemFromPayloadTransformer
}
