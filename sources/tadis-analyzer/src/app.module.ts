import { Module } from '@nestjs/common'

import { CollectorModule } from './collector/collector.module'

@Module({
  imports: [
    CollectorModule
  ],
  controllers: [],
  providers: []
})
export class AppModule { }
