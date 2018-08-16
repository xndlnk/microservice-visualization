import * as _ from 'lodash'
import { Node } from './model'
import { GraphService } from './service'

export class NodeFocusser {

  private graphService: GraphService

  constructor(graphService: GraphService) {
    this.graphService = graphService
  }

  focusNodeById(focusedNodeId: string): Node {
    return this.focusNode(this.graphService.findNode(focusedNodeId))
  }

  focusNode(focusedNode: Node): Node {
    const neighbourNodeIds = this.graphService.getNeighbourNodeIds(focusedNode.id)
    const allInnerNodeIds = this.graphService.getAllNodesOfNode(focusedNode).map(node => node.id)

    const additionalIds: string[] = []
    if (this.graphService.isNotConnected(focusedNode)) {
      this.graphService.getAllEdges().forEach(edge => {
        if (allInnerNodeIds.includes(edge.sourceId)) {
          additionalIds.push(edge.targetId)
        }
        if (allInnerNodeIds.includes(edge.targetId)) {
          additionalIds.push(edge.sourceId)
        }
      })
    }

    const nodeIdsToKeep = _.union([ focusedNode.id ], neighbourNodeIds, allInnerNodeIds, additionalIds)

    return this.graphService.reduce(nodeIdsToKeep)
  }

}
