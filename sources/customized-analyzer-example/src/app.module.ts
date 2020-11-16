import { Module } from '@nestjs/common'
import { ConfigModule } from 'tadis-analyzer'
import { SimpleCollectorModule } from './simple-source-analyzer/SimpleCollector.module'

@Module({
  imports: [
    ConfigModule,
    SimpleCollectorModule
  ],
  controllers: [],
  providers: []
})
export class AppModule { }
