import { Node } from '~/model/model'

export class ManualAdditionsMarker {
  markNodesAndEdges(node: Node): Node {
    node.getNodes().forEach(subNode => {
      subNode.addProperty('warning', 'manual addition')
      this.markNodesAndEdges(subNode)
    })
    node.getEdges().forEach(edge => edge.addProperty('warning', 'manual addition'))
    return node
  }
}
