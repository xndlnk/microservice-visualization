import { Injectable } from '@nestjs/common'
import * as _ from 'lodash'

import { System, MicroService } from '../../model/ms'
import { ModuleRef } from '@nestjs/core'
import { MicroservicesFromServicesProducer } from '../transformer/MicroservicesFromServicesProducer'

@Injectable()
export class KubernetesCollectorService {

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly microservicesFromK8s: MicroservicesFromServicesProducer
  ) { }

  public async getAllMicroservices(): Promise<MicroService[]> {
    const system = await this.microservicesFromK8s.transform(new System('')) as System
    return system.getMicroServices()
  }

  public async transform(unusedSystem: System): Promise<System> {
    let system = new System('')

    system = await this.getProvider('MicroservicesFromServicesProducer').transform(system)
    system = await this.getProvider('EnvVarsFromPodsDecorator').transform(system)
    system = await this.getProvider('LabelsFromDeploymentsDecorator').transform(system)

    return system
  }

  private getProvider(className: string): any {
    return this.moduleRef.get(className)
  }
}
