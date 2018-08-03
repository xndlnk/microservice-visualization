import * as domain from '~/model/model'
import { Node, Edge } from './model'

export class ModelConverter {
  convertNode(domainNode: domain.Node): Node {
    const node: Node = {
      id: domainNode.getId(),
      name: domainNode.getName(),
      type: domainNode.getType()
    }
    if (domainNode.getProperties() && Object.keys(domainNode.getProperties()).length > 0) {
      node.properties = domainNode.getProperties()
    }
    if (domainNode.getNodes().length > 0) {
      node.nodes = domainNode.getNodes().map(node => this.convertNode(node))
    }
    if (domainNode.getEdges().length > 0) {
      node.edges = domainNode.getEdges().map(edge => this.convertEdge(edge))
    }
    return node
  }

  private convertEdge(domainEdge: domain.Edge): Edge {
    const edge: Edge = {
      sourceId: domainEdge.getSource().getId(),
      targetId: domainEdge.getTarget().getId(),
      type: domainEdge.getType()
    }
    if (domainEdge.getProperties() && Object.keys(domainEdge.getProperties()).length > 0) {
      edge.properties = domainEdge.getProperties()
    }
    return edge
  }
}
