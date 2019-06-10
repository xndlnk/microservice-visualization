import { Module } from '@nestjs/common'

import { ConfigModule } from '../config/config.module'
import { SourceCodeAnalysisModule } from 'src/source-code-analysis/SourceCodeAnalysis.module'
import { AnnotationAnalyzer } from './AnnotationAnalyzer.service'

@Module({
  imports: [
    ConfigModule,
    SourceCodeAnalysisModule
  ],
  controllers: [],
  providers: [
    AnnotationAnalyzer
  ]
})
class JavaModule { }

export {
  JavaModule,
  AnnotationAnalyzer
}
