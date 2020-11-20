import { Module } from '@nestjs/common'

import { ConfigModule } from '../../config/Config.module'
import { FeignClientAnnotationAnalyzer } from './FeignClientAnnotationAnalyzer'

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [FeignClientAnnotationAnalyzer],
  exports: [FeignClientAnnotationAnalyzer]
})
class SpringBootModule {}

export { SpringBootModule, FeignClientAnnotationAnalyzer }
