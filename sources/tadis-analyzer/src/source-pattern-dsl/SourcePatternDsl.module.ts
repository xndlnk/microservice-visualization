import { Module } from '@nestjs/common'

import { ConfigModule } from '../config/Config.module'
import { SourceCodeAnalysisModule } from '../source-code-analysis/SourceCodeAnalysis.module'
import * as pt from './PatternAnalyzer.service'

@Module({
  imports: [
    ConfigModule,
    SourceCodeAnalysisModule
  ],
  controllers: [],
  providers: [
    pt.PatternAnalyzerService
  ],
  exports: [
    pt.PatternAnalyzerService
  ]
})
class SourcePatternDslModule { }

export {
  SourcePatternDslModule,
  pt as patternAnalyzer
}
