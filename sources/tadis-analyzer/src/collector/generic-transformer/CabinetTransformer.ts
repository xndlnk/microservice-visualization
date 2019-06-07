import { Injectable, Logger } from '@nestjs/common'
import * as _ from 'lodash'

import { System, MessageExchange } from '../../model/ms'
import { Node } from 'src/model/core'

@Injectable()
export class CabinetTransformer {
  private readonly logger = new Logger(CabinetTransformer.name)

  public async transform(system: System): Promise<System> {
    return this.transformCabinetsToSubSystems(system)
  }

  transformCabinetsToSubSystems(system: System): System {
    const transformedSystem = new System(system.id)
    transformedSystem.content = system.content

    system.nodes.forEach(childNode => {
      const cabinetName = this.getCabinetName(system, childNode)
      if (cabinetName) {
        const cabinetNode = this.getOrElseCreateCabinetNode(transformedSystem, cabinetName)

        cabinetNode.nodes.push(childNode)
        this.logger.log(`added node ${childNode.id} to cabinet ${cabinetName}`)
      } else {
        transformedSystem.nodes.push(childNode)
        this.logger.log(`added node ${childNode.id} to root system`)
      }
    })

    system.edges.forEach(edge => {
      const sourceCabinet: string = edge.source.content.payload.labels && edge.source.content.payload.labels.cabinet
      const targetCabinet: string = edge.target.content.payload.labels && edge.target.content.payload.labels.cabinet
      if (sourceCabinet && targetCabinet && sourceCabinet === targetCabinet) {
        const cabinetNode = this.getOrElseCreateCabinetNode(transformedSystem, sourceCabinet)
        cabinetNode.edges.push(edge)
      } else {
        transformedSystem.edges.push(edge)
      }
    })

    return transformedSystem
  }

  private getCabinetName(system: System, node: Node): string {
    if (node.content.type === MessageExchange.name) {
      return this.getCabinetOfExchange(system, node as MessageExchange)
    } else if (node.content.payload
      && node.content.payload.labels
      && node.content.payload.labels.cabinet) {
      return node.content.payload.labels.cabinet
    }
    return undefined
  }

  private getOrElseCreateCabinetNode(system: System, cabinetName: string): System {
    const existingNode = system.findTypedNodeWithName<System>(System, cabinetName)
    if (existingNode) return existingNode

    const newNode = new System(cabinetName)
    system.nodes.push(newNode)
    this.logger.log(`added sub-system ${cabinetName}`)
    return newNode
  }

  private getCabinetOfExchange(system: System, exchange: MessageExchange): string {
    const incomingEdges = system.edges.filter(edge => edge.target.id === exchange.id)
    if (incomingEdges.length === 1) {
      const sourcePayload = incomingEdges[0].source.content.payload
      if (sourcePayload && sourcePayload.labels) {
        return sourcePayload.labels.cabinet
      }
    }
    return undefined
  }
}
