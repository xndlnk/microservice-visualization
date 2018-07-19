import { Node, Edge, System } from '~/model/model'
import { createLogger } from '~/logging'

const logger = createLogger('subsystem-transformer')

export class SubsystemPropertyTransformer {

  transformSubsystemPropertiesToSubsystems(system: System): System {
    const transformedSystem = new System(system.getName(), null, null, system.getProperties())

    system.getNodes().forEach(childNode => {
      const subsystemProperty = childNode.getProperties().subsystem
      if (!subsystemProperty) {
        transformedSystem.addNodeUniquely(childNode)
        logger.info('added ' + childNode.getName() + ' to system ' + system.getName())
      } else {
        const subsystem = transformedSystem.addNodeUniquelyAndReturn(new System(subsystemProperty))
        subsystem.addNodeUniquely(childNode)
        logger.info('added ' + childNode.getName() + ' to subsystem ' + subsystem.getName())
      }
    })

    system.getEdges().forEach(edge => {
      const sourceSubsystem: string = edge.getSource().getProperties().subsystem || null
      const targetSubsystem: string = edge.getTarget().getProperties().subsystem || null
      if (sourceSubsystem && targetSubsystem && sourceSubsystem === targetSubsystem) {
        transformedSystem.findNodeById(new System(sourceSubsystem).getId()).addEdgeUniquely(edge)
      } else {
        transformedSystem.addEdgeUniquely(edge)
      }
    })

    return transformedSystem
  }

  getEdgesToAnFromNode(node: Node): Edge[] {
    return node.getEdges().filter(edge => edge.getSource().getId() === node.getId()
      || edge.getTarget().getId() === node.getId())
  }

}
