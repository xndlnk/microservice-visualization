import { Injectable } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import * as _ from 'lodash'

import { System, MicroService } from '../../model/ms'
import { SourceLocationDecorator } from '../../source-code-analysis/SourceCodeAnalysis.module'
import { Collector } from './Collector'
import { RabbitMqBindingsFromApiAnalyzer } from '../rabbitmq/RabbitMq.module'
import { MicroservicesFromKubernetesCreator } from '../kubernetes/Kubernetes.module'

@Injectable()
export class KubernetesRabbitMqCollectorService implements Collector {

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly microservicesCreator: MicroservicesFromKubernetesCreator,
    private readonly rabbitMqApiAnalyzer: RabbitMqBindingsFromApiAnalyzer,
    private readonly sourceLocationDecorator: SourceLocationDecorator
  ) { }

  public async getAllMicroservices(): Promise<MicroService[]> {
    const system = await this.microservicesCreator.transform(new System(''))
    return system.getMicroServices()
  }

  public async getSystem(): Promise<System> {
    let system = new System('')

    system = await this.microservicesCreator.transform(system)
    system = await this.rabbitMqApiAnalyzer.transform(system)

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
