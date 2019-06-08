import { Injectable } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import * as _ from 'lodash'

import { System, MicroService } from '../model/ms'
import { KubernetesCollectorService } from '../kubernetes/collector/KubernetesCollector.service'
import { RabbitMqCollectorService } from '../rabbitmq/collector/RabbitMqCollector.service'
import { SubSystemTransformerService } from '../msa/common/MsaCommon.module'

@Injectable()
export class CollectorService {

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly kubernetesCollector: KubernetesCollectorService,
    private readonly rabbitMqCollector: RabbitMqCollectorService,
    private readonly subSystemTransformer: SubSystemTransformerService
  ) { }

  public async getAllMicroservices(): Promise<MicroService[]> {
    return this.kubernetesCollector.getAllMicroservices()
  }

  public async getSystem(): Promise<System> {
    let system = new System('')

    system = await this.kubernetesCollector.transform(system)
    system = await this.rabbitMqCollector.transform(system)

    system = await this.getProvider('FeignClientsFromSourceCodeProducer').transform(system)
    system = await this.getProvider('SourceLocationDecorator').transform(system)

    // INFO: actually this is no collector. we keep here for compatibility reasons
    // but it might be removed in the future.
    system = await this.getProvider('ExcludedNodesRemover').transform(system)
    system = await this.getProvider('MicroserviceWithMessageExchangeMerger').transform(system)
    system = await this.subSystemTransformer.transform(system, SubSystemTransformerService.getSubSystemNameFromCabinetLabel)

    return system
  }

  private getProvider(className: string): any {
    return this.moduleRef.get(className,
      // gets provider from any module in the system
      { strict: false })
  }
}
