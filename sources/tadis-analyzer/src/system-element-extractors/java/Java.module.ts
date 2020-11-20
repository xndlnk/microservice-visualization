import { Module } from '@nestjs/common'

import { ConfigModule } from '../../config/Config.module'
import { SourceCodeAnalysisModule } from '../../deprecated-modules/SourceCodeAnalysis.module'
import {
  JavaAnnotationAnalyzer,
  ElementMapping
} from './JavaAnnotationAnalyzer'
import { GitModule } from '../../git/Git.module'

@Module({
  imports: [ConfigModule, GitModule],
  controllers: [],
  providers: [JavaAnnotationAnalyzer],
  exports: [JavaAnnotationAnalyzer]
})
class JavaModule {}

export { JavaModule, JavaAnnotationAnalyzer, ElementMapping }
