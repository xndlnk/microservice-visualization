import { Module } from '@nestjs/common'

import { ConfigModule } from '../config/Config.module'
import { SourceCodeAnalysisModule } from '../source-code-analysis/SourceCodeAnalysis.module'
import { JavaAnnotationAnalyzer, ElementMapping } from './JavaAnnotationAnalyzer'

@Module({
  imports: [
    ConfigModule,
    SourceCodeAnalysisModule
  ],
  controllers: [],
  providers: [
    JavaAnnotationAnalyzer
  ],
  exports: [
    JavaAnnotationAnalyzer
  ]
})
class JavaModule { }

export {
  JavaModule,
  JavaAnnotationAnalyzer,
  ElementMapping
}
