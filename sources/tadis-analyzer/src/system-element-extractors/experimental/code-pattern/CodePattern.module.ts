import { Module } from '@nestjs/common'

import { ConfigModule } from '../../../config/Config.module'
import { PatternAnalyzerService } from './PatternAnalyzer.service'
import { PatternAnalyzerController } from './PatternAnalyzer.controller'

@Module({
  imports: [ConfigModule],
  controllers: [PatternAnalyzerController],
  providers: [PatternAnalyzerService],
  exports: [PatternAnalyzerService]
})
class CodePatternModule {}

export { CodePatternModule, PatternAnalyzerService }
