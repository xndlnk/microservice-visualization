import { Module } from '@nestjs/common'
import { ConfigModule } from 'tadis-analyzer'

import { CustomCollectorModule } from './complex-collector/CustomCollector.module'
import { MySourceOnlyCollectorModule } from './my-source-only-collector/MySourceOnlyCollector.module'

@Module({
  imports: [
    ConfigModule,
    // CustomCollectorModule
    MySourceOnlyCollectorModule
  ],
  controllers: [],
  providers: []
})
export class AppModule { }
