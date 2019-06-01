import { Module } from '@nestjs/common'

import { CollectorModule } from './collector/collector.module'
import { CustomCollectorModule } from './custom-example/CustomCollector.module'

@Module({
  imports: [
    // CollectorModule
    CustomCollectorModule
  ],
  controllers: [],
  providers: []
})
export class AppModule { }
