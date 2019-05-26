import { Injectable, Logger } from '@nestjs/common'
import * as _ from 'lodash'

import { ConfigService } from '../../config/Config.service'
import { System, AsyncEventFlow } from '../../model/ms'

@Injectable()
export class ExchangesFromEnvVarsProducer {
  private readonly className = ExchangesFromEnvVarsProducer.name
  private readonly logger = new Logger(this.className)

  constructor(
    private readonly config: ConfigService
  ) { }

  /**
   * looks for env vars that configure an exchange and adds corresponding system nodes.
   *
   * @param system: requires nodes to have payloads of type NodePayload
   */
  public async transform(system: System): Promise<System> {
    system.getMicroServices().forEach(service => {
      const env = service.getPayload().env
      if (env) {
        env.filter(envEntry => envEntry.name.includes('EXCHANGE'))
          .forEach(envEntry => {
            if (envEntry.name.includes('OUTGOING')) {
              const outgoingExchange = system.addMessageExchange(envEntry.value, undefined, this.className)
              const edge = new AsyncEventFlow(service, outgoingExchange, undefined, this.className)
              system.edges.push(edge)
              this.logger.log(`added outgoing exchange ${envEntry.value} for service ${service.getPayload().name}`)
            }
            if (envEntry.name.includes('INCOMING')) {
              const incomingExchange = system.addMessageExchange(envEntry.value, undefined, this.className)
              const eventFlow = new AsyncEventFlow(incomingExchange, service, undefined, this.className)
              system.edges.push(eventFlow)
              this.logger.log(`added incoming exchange ${envEntry.value} for service ${service.getPayload().name}`)
            }
          })
      }
    })
    return system
  }
}
