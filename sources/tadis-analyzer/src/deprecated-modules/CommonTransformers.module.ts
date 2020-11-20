import { Module } from '@nestjs/common'

import { ConfigModule } from '../config/Config.module'
import { StaticNodeFilter } from '../post-processors/StaticNodeFilter'
import { SubSystemFromPayloadTransformer } from '../post-processors/SubSystemFromPayloadTransformer'

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [StaticNodeFilter, SubSystemFromPayloadTransformer],
  exports: [StaticNodeFilter, SubSystemFromPayloadTransformer]
})
/**
 * @deprecated use PostProcessorsModule
 */
class CommonTransformersModule {}

export {
  CommonTransformersModule,
  StaticNodeFilter,
  SubSystemFromPayloadTransformer
}
