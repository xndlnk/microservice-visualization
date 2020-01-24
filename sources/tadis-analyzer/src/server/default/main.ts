import { NestFactory } from '@nestjs/core'
import { Logger } from '@nestjs/common'

import { MsaModule } from '../../msa/Msa.module'

async function bootstrap() {
  const app = await NestFactory.create(MsaModule)
  const config = app.get('ConfigService')

  await app.listen(config.getPort())
  Logger.log('running at http://localhost:' + config.getPort())
}
// tslint:disable-next-line: no-floating-promises
bootstrap()
