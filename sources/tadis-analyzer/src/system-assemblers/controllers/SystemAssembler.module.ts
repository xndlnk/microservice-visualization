import { Module } from '@nestjs/common'

import { ConfigModule } from '../../config/Config.module'
import { SystemAssemblerController } from './SystemAssembler.controller'
import { SystemAssembler } from './SystemAssembler.service'
import { ISystemAssembler } from './ISystemAssembler'
import { GitModule } from '../../git/Git.module'

@Module({
  imports: [ConfigModule, GitModule],
  controllers: [SystemAssemblerController],
  providers: [SystemAssembler],
  exports: [SystemAssembler]
})
class SystemAssemblerModule {}

export {
  SystemAssemblerModule,
  SystemAssembler,
  SystemAssemblerController,
  ISystemAssembler
}
