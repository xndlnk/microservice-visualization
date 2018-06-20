import * as v1 from '~/model/model'
import * as v0 from '~/model/modelClasses'
import { V0toV1ModelConverter } from '~/model/V0toV1ModelConverter'
import * as _ from 'lodash'
import { createLogger } from '~/logging'

const logger = createLogger('system-merger')

/** merges many v0 and many v1 systems into one v1 system. */
export class V1SystemMerger {

  mergeWithoutSubSystems(v0systems: v0.System[], v1systems: v1.System[]): v1.System {
    logger.info('merging ' + (v0systems.length + v1systems.length) + ' systems')
    const mergedSystem = new v1.System(this.mergeSystemNames(v0systems, v1systems))

    const modelConverter = new V0toV1ModelConverter()
    const v0systemsAsV1systems = v0systems.map(v0system => modelConverter.convertSystem(v0system))

    _.union(v1systems, v0systemsAsV1systems).forEach(v1system => {
      this.mergeIntoNodesOfParentNode(v1system.getNodes(), mergedSystem)
      v1system.getEdges().forEach(edge => mergedSystem.addEdgeUniquely(edge))
    })

    return mergedSystem
  }

  mergeSystemNames(v0systems: v0.System[], v1systems: v1.System[]): string {
    const systemNames = this.getSystemNames(v0systems, v1systems)
    if (this.allSystemsHaveTheSameName(systemNames)) {
      return systemNames[0]
    } else {
      return systemNames.join('-')
    }
  }

  mergeIntoNodesOfParentNode(nodes: v1.Node[], parentNode: v1.Node) {
    nodes.forEach(node => {
      if (node instanceof v1.System) {
        logger.warn('cannot merge subsystem ' + node.getName())
      }

      if (!parentNode.addNodeUniquely(node)) {
        const existingNode = parentNode.deepFindNodeById(node.getId())
        Object.keys(node.getProperties()).forEach(propName => existingNode.addProperty(propName, node.getProperties()[propName]))
      }
    })
  }

  getSystemNames(v0systems: v0.System[], v1systems: v1.System[]): string[] {
    return _.union(v0systems.map(system => system.name), v1systems.map(system => system.getName()))
  }

  allSystemsHaveTheSameName(names: string[]): boolean {
    return _.intersection(names).length === 1
  }
}
