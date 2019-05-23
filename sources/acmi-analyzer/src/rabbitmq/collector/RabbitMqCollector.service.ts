import { Injectable } from '@nestjs/common'
import * as _ from 'lodash'

import { System } from '../../model/ms'
import { ModuleRef } from '@nestjs/core'

@Injectable()
export class RabbitMqCollectorService {

  constructor(
    private readonly moduleRef: ModuleRef
  ) { }

  public async transform(inputSystem: System): Promise<System> {
    let system = new System('')

    system = await this.getProvider('ExchangesFromEnvVarsProducer').transform(inputSystem)
    system = await this.getProvider('ExchangesFromSourceCodeProducer').transform(system)
    system = await this.getProvider('ExchangesFromApiProducer').transform(system)

    return system
  }

  private getProvider(className: string): any {
    return this.moduleRef.get(className)
  }
}
