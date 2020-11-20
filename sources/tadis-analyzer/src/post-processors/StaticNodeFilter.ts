import { Injectable, Logger } from '@nestjs/common'
import * as _ from 'lodash'

import { ConfigService } from '../config/Config.service'
import { System } from '../model/ms'

@Injectable()
export class StaticNodeFilter {
  private readonly logger = new Logger(StaticNodeFilter.name)

  constructor(
    private readonly config: ConfigService
  ) { }

  public async transform(system: System): Promise<System> {
    const namesToRemove = this.config.getExcludedNodeNames()

    system.edges = system.edges
      .filter(edge => {
        const sourceNodeName = edge.source.content.payload.name
        const targetNodeName = edge.target.content.payload.name
        if (this.shouldBeRemoved(namesToRemove, sourceNodeName)
          || this.shouldBeRemoved(namesToRemove, targetNodeName)) {
          this.logger.log(`removing edge ${sourceNodeName} -> ${targetNodeName} of excluded node`)
          return false
        }
        return true
      })

    const nodesRemoved: string[] = []
    system.nodes = system.nodes
      .filter(node => {
        const nodeName = node.content.payload.name
        if (this.shouldBeRemoved(namesToRemove, nodeName)) {
          nodesRemoved.push(nodeName)
          this.logger.log('removing excluded node named ' + nodeName)
          return false
        }
        return true
      })
    system.content.metadata = {
      transformer: StaticNodeFilter.name,
      context: 'system.nodes',
      info: _.uniq(nodesRemoved).join(', ')
    }

    return system
  }

  private shouldBeRemoved(namesToRemove: string[], nodeName: string): boolean {
    for (const nameToRemove of namesToRemove) {
      const regexp = new RegExp(nameToRemove)
      if (nodeName.match(regexp)) {
        return true
      }
    }
    return false
  }

}
