import { Module } from '@nestjs/common'

import { FeignClientsFromSourceCodeProducer } from './feign/FeignClientsFromSourceCodeProducer'
import { ExcludedNodesRemover } from './generic-transformer/ExcludedNodesRemover'
import { MicroserviceWithMessageExchangeMerger } from './generic-transformer/MicroserviceWithMessageExchangeMerger'
import { ConfigModule } from '../config/config.module'
import { SourceCodeAnalysisModule } from '../source-code-analysis/SourceCodeAnalysis.module'
import { AnnotationAnalyzer, ElementMapping } from './java-source/AnnotationAnalyzer.service'
import { MsaCommonModule } from '../msa/common/MsaCommon.module'

@Module({
  imports: [
    ConfigModule,
    SourceCodeAnalysisModule,
    MsaCommonModule
  ],
  providers: [
    ExcludedNodesRemover,
    FeignClientsFromSourceCodeProducer,
    AnnotationAnalyzer,
    // INFO: actually this is no collector. we keep here for compatibility reasons
    // but it might be removed in the future.
    MicroserviceWithMessageExchangeMerger
  ],
  exports: [
    ExcludedNodesRemover,
    FeignClientsFromSourceCodeProducer,
    AnnotationAnalyzer,
    MicroserviceWithMessageExchangeMerger
  ]
})
class TransformerModule { }

export {
  TransformerModule, ExcludedNodesRemover, FeignClientsFromSourceCodeProducer, AnnotationAnalyzer, ElementMapping,
  MicroserviceWithMessageExchangeMerger
}
