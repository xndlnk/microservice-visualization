import { NestFactory } from '@nestjs/core'
import { Logger } from '@nestjs/common'

import { MsaModule } from './msa/Msa.module'
import { ConfigService } from './config/Config.service'

async function bootstrap() {
  const app = await NestFactory.create(MsaModule)
  const config = app.get('ConfigService') as ConfigService

  await app.listen(config.getPort())
  Logger.log('running at http://localhost:' + config.getPort())
}
bootstrap()
