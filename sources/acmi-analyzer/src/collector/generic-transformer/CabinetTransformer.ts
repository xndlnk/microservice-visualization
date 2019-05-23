import { Injectable, Logger } from '@nestjs/common'
import * as _ from 'lodash'

import { System } from '../../model/ms'

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
      if (!childNode.content.payload.labels || !childNode.content.payload.labels.cabinet) {
        transformedSystem.nodes.push(childNode)
        this.logger.log(`added node ${childNode.id} to root system`)
      } else {
        const cabinetName = childNode.content.payload.labels.cabinet
        const cabinetNode = this.getOrElseCreateCabinetNode(transformedSystem, cabinetName)

        cabinetNode.nodes.push(childNode)
        this.logger.log(`added node ${childNode.id} to cabinet ${cabinetName}`)
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

  private getOrElseCreateCabinetNode(system: System, cabinetName: string): System {
    const existingNode = system.findNodeWithNameInPayload<System>(System, cabinetName)
    if (existingNode) return existingNode

    const newNode = new System(cabinetName)
    system.nodes.push(newNode)
    this.logger.log(`added sub-system ${cabinetName}`)
    return newNode
  }
}
