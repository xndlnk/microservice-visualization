import { Module } from '@nestjs/common'

import { FeignClientsFromSourceCodeProducer } from './feign/FeignClientsFromSourceCodeProducer'
import { ExcludedNodesRemover } from './generic-transformer/ExcludedNodesRemover'
import { CabinetTransformer } from './generic-transformer/CabinetTransformer'
import { MicroserviceWithMessageExchangeMerger } from './generic-transformer/MicroserviceWithMessageExchangeMerger'
import { ConfigModule } from '../config/config.module'
import { SourceCodeAnalysisModule } from '../source-code-analysis/SourceCodeAnalysis.module'
import { AnnotationAnalyzer } from './java-source/AnnotationAnalyzer.service'

@Module({
  imports: [
    ConfigModule,
    SourceCodeAnalysisModule
  ],
  providers: [
    ExcludedNodesRemover,
    FeignClientsFromSourceCodeProducer,
    AnnotationAnalyzer,
    // INFO: actually this is no collector. we keep here for compatibility reasons
    // but it might be removed in the future.
    CabinetTransformer,
    MicroserviceWithMessageExchangeMerger
  ],
  exports: [
    ExcludedNodesRemover,
    FeignClientsFromSourceCodeProducer,
    AnnotationAnalyzer,
    CabinetTransformer,
    MicroserviceWithMessageExchangeMerger
  ]
})
export class TransformerModule { }
