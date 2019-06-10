import { Injectable } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import * as _ from 'lodash'

import { System, MicroService } from '../../model/ms'
import { KubernetesCollectorService } from '../kubernetes/collector/KubernetesCollector.service'
import { SourceLocationDecorator } from '../../source-code-analysis/SourceCodeAnalysis.module'
import { Collector } from './Collector'
import { ExchangesFromApiProducer } from '../rabbitmq/RabbitMq.module'

@Injectable()
export class KubernetesRabbitMqCollectorService implements Collector {

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly kubernetesCollector: KubernetesCollectorService,
    private readonly exchangesFromApiProducer: ExchangesFromApiProducer,
    private readonly sourceLocationDecorator: SourceLocationDecorator
  ) { }

  public async getAllMicroservices(): Promise<MicroService[]> {
    return this.kubernetesCollector.getAllMicroservices()
  }

  public async getSystem(): Promise<System> {
    let system = new System('')

    system = await this.kubernetesCollector.transform(system)
    system = await this.exchangesFromApiProducer.transform(system)

    system = await this.sourceLocationDecorator.transform(system)

    // INFO: this just shows how providers can be accessed dynamic
    system = await this.getProvider('StaticNodeFilter').transform(system)

    return system
  }

  private getProvider(className: string): any {
    return this.moduleRef.get(className,
      // gets provider from any module in the system
      { strict: false })
  }
}
