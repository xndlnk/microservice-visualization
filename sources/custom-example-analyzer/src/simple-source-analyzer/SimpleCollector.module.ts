import { Module } from "@nestjs/common";

import {
  ConfigModule,
  SourceCodeAnalysisModule,
  DefaultCollectorService,
  JavaModule,
  CollectorController,
  MsaModule,
  CommonTransformersModule,
} from "tadis-analyzer";

import { SimpleCollectorService } from "./SimpleCollector.service";

const customCollectorProvider = {
  provide: DefaultCollectorService,
  useClass: SimpleCollectorService,
};

@Module({
  imports: [
    ConfigModule,
    SourceCodeAnalysisModule,
    JavaModule,
    MsaModule,
    CommonTransformersModule,
  ],
  controllers: [CollectorController],
  providers: [customCollectorProvider],
  exports: [],
})
export class SimpleCollectorModule {}
