import { Injectable, Logger } from '@nestjs/common'
import * as _ from 'lodash'

import { System, AsyncEventFlow, MicroService, MessageExchange } from '../../model/ms'
import { Node, Edge } from '../../model/core'

@Injectable()
export class MicroserviceWithMessageExchangeMerger {
  private readonly logger = new Logger(MicroserviceWithMessageExchangeMerger.name)

  public async transform(system: System): Promise<System> {
    return this.merge(system)
  }

  private merge(system: System): System {
    const result = new System(system.id)
    result.content = system.content

    this.getNonMessageExchanges(system).forEach(node => {
      result.nodes.push(node)
    })

    const mergedExchanges: Node[] = []
    system.nodes.forEach(node => {
      if (node.content.type === MessageExchange.name) {
        const exchange = node as MessageExchange

        if (this.isTargetOfSameNameMicroService(exchange, system) || this.isSourceOfSameNameMicroService(exchange, system)) {
          const service = system.findMicroService(exchange.getName())
          if (service) {
            this.extendPayloadOfMicroService(result, service, exchange.content.payload)

            this.getOtherExchangeEdgesRedirectedToService(system, exchange, service)
              .forEach(edge => result.edges.push(edge))

            mergedExchanges.push(exchange)
            this.logger.log(`merged exchange ${exchange.id} with service ${service.id}`)
          }
        } else {
          result.nodes.push(exchange)
        }
      }
    })

    this.getEdgesNotConnectedToMergedExchanges(mergedExchanges, system)
      .forEach(edge => {
        result.edges.push(edge)
      })

    return result
  }

  private getEdgesNotConnectedToMergedExchanges(nodes: Node[], system: System): Edge[] {
    return system.edges.filter(edge => !nodes.includes(edge.source) && !nodes.includes(edge.target))
  }

  private getOtherExchangeEdgesRedirectedToService(system: System, exchange: MessageExchange, service: MicroService): Edge[] {
    return system.edges.filter(edge =>
      (edge.source === exchange || edge.target === exchange)
      && edge.source !== edge.target
      && !(edge.source.content.type === MicroService.name && edge.source.hasSameNameAs(exchange))
      && !(edge.target.content.type === MicroService.name && edge.target.hasSameNameAs(exchange)))
      .map(exchangeEdge => {
        const source = exchangeEdge.source === exchange ? service : exchangeEdge.source
        const target = exchangeEdge.target === exchange ? service : exchangeEdge.target
        const newEdge = new AsyncEventFlow(source, target, exchangeEdge.content.payload)

        this.logger.log(`redirected ${exchangeEdge.source.id} -> ${exchangeEdge.target.id}`
          + ` to ${newEdge.source.id} -> ${newEdge.target.id}`)

        return newEdge
      })
  }

  private getNonMessageExchanges(system: System): Node[] {
    return system.nodes.filter(node => node.content.type !== MessageExchange.name)
  }

  private extendPayloadOfMicroService(system: System, service: MicroService, extraPayload: any) {
    service.content.payload.reduced = true
    Object.getOwnPropertyNames(extraPayload)
      .forEach(payloadPropertyName => service.content.payload[payloadPropertyName] = extraPayload[payloadPropertyName])
  }

  private isSourceOfSameNameMicroService(exchange: MessageExchange, system: System): boolean {
    return system.edges.find(edge => edge.source.id === exchange.id
      && edge.target.hasSameNameAs(exchange)
      && edge.target.content.type === MicroService.name
    ) !== undefined
  }

  private isTargetOfSameNameMicroService(exchange: MessageExchange, system: System): boolean {
    return system.edges.find(edge => edge.target.id === exchange.id
      && edge.source.hasSameNameAs(exchange)
      && edge.source.content.type === MicroService.name
    ) !== undefined
  }
}
