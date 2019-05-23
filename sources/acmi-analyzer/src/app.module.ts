import { Module } from '@nestjs/common'

import { CollectorModule } from './collector/collector.module'
import { ConfigModule } from './config/config.module'

@Module({
  imports: [
    CollectorModule,
    ConfigModule
  ],
  controllers: [],
  providers: []
})
export class AppModule { }
