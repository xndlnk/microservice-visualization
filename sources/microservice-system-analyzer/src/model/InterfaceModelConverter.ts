import { Node, Edge } from './model'
import { INode, IEdge } from './interfaceModel'

export class InterfaceModelConverter {
  convertNode(node: Node): INode {
    const result: INode = {
      id: node.getId(),
      name: node.getName(),
      type: node.getType()
    }
    if (node.getProperties() && Object.keys(node.getProperties()).length > 0) {
      result.properties = node.getProperties()
    }
    if (node.getNodes().length > 0) {
      result.nodes = node.getNodes().map(node => this.convertNode(node))
    }
    if (node.getEdges().length > 0) {
      result.edges = node.getEdges().map(edge => this.convertEdge(edge))
    }
    return result
  }

  private convertEdge(edge: Edge): IEdge {
    const result: IEdge = {
      sourceId: edge.getSource().getId(),
      targetId: edge.getTarget().getId(),
      type: edge.getType()
    }
    if (edge.getProperties() && Object.keys(edge.getProperties()).length > 0) {
      result.properties = edge.getProperties()
    }
    return result
  }
}
