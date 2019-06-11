import { Module } from '@nestjs/common'

import { ConfigModule } from '../config/Config.module'
import { SourceCodeAnalysisModule } from 'src/source-code-analysis/SourceCodeAnalysis.module'
import { JavaAnnotationAnalyzer } from './JavaAnnotationAnalyzer'

@Module({
  imports: [
    ConfigModule,
    SourceCodeAnalysisModule
  ],
  controllers: [],
  providers: [
    JavaAnnotationAnalyzer
  ]
})
class JavaModule { }

export {
  JavaModule,
  JavaAnnotationAnalyzer
}
