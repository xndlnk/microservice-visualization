import { Module } from '@nestjs/common'

import { ConfigModule } from '../config/Config.module'
import { SourceCodeAnalysisModule } from '../source-code-analysis/SourceCodeAnalysis.module'
import * as pt from './PatternAnalyzer'

@Module({
  imports: [
    ConfigModule,
    SourceCodeAnalysisModule
  ],
  controllers: [],
  providers: [
    pt.PatternAnalyzer
  ],
  exports: [
    pt.PatternAnalyzer
  ]
})
class SourcePatternDslModule { }

export {
  SourcePatternDslModule,
  pt as patternAnalyzer
}
