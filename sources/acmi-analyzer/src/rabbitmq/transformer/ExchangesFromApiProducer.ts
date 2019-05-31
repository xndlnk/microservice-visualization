import { Injectable, Logger } from '@nestjs/common'
import * as _ from 'lodash'

import { ConfigService } from '../../config/Config.service'
import { System, AsyncEventFlow } from '../../model/ms'
import { RabbitMqManagementApiService } from '../api/api.service'

type Binding = {
  exchange: string
  queue: string
}

@Injectable()
export class ExchangesFromApiProducer {
  private readonly logger = new Logger(ExchangesFromApiProducer.name)

  constructor(
    private readonly config: ConfigService,
    private readonly apiService: RabbitMqManagementApiService
  ) { }

  public async transform(system: System): Promise<System> {
    const queueNames = await this.getQueueNames()

    const bindingsPromises: Promise<Binding[]>[] = queueNames.map(queue => this.getBindings(queue))
    const bindings: Binding[][] = await Promise.all(bindingsPromises)
    const allBindings: Binding[] = _.flatMap(bindings)

    this.addEdgesFromBindings(system, allBindings)

    return system
  }

  private async getQueueNames() {
    const queues = await this.apiService.getQueues()
    if (!queues) return []

    return queues.map(queue => { return queue.name })
  }

  private addEdgesFromBindings(system: System, bindings: Binding[]) {
    bindings
      .filter(binding => binding.exchange !== '')
      .forEach(binding => {
        const sourceExchangName = binding.exchange
        const sourceExchange = system.addMessageExchange(sourceExchangName, undefined, ExchangesFromApiProducer.name)

        const targetServiceName = binding.queue.substring(0, binding.queue.indexOf('.'))
        const targetService = system.addMicroService(targetServiceName, undefined, ExchangesFromApiProducer.name)

        system.edges.push(new AsyncEventFlow(sourceExchange, targetService, undefined, ExchangesFromApiProducer.name))

        this.logger.log('added async event flow: message exchange ' + sourceExchangName + ' -> microservice ' + targetServiceName)
      })
    return system
  }

  private async getBindings(queueName): Promise<Binding[]> {
    const bindingsData = await this.apiService.getBindings(queueName)

    const bindings: Binding[] = bindingsData.filter(element => element.source !== '')
      .map(element => {
        const binding = {
          'exchange': element.source,
          'queue': queueName
        }
        this.logger.log('found binding of queue ' + binding.queue + ' to exchange ' + binding.exchange)
        return binding
      })

    return bindings
  }

}
