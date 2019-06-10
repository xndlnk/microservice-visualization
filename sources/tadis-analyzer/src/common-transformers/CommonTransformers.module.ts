import { Module } from '@nestjs/common'

import { ConfigModule } from '../config/config.module'
import { StaticNodeFilter } from './StaticNodeFilter'
import { SubSystemTransformerService } from './SubSystemTransformer'

@Module({
  imports: [
    ConfigModule
  ],
  controllers: [],
  providers: [
    StaticNodeFilter,
    SubSystemTransformerService
  ]
})
class CommonTransformersModule { }

export { CommonTransformersModule, StaticNodeFilter, SubSystemTransformerService }
