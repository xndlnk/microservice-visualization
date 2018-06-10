import { Node, Edge, Props } from './nodeModel'

export interface RawNode {
  id: string
  nodes?: RawNode[]
  edges?: RawEdge[]
  props?: Props
}

export interface RawEdge {
  sourceId: string
  targetId: string
  props?: Props
}

export class RawModelConverter {

  static convertToNode(rawNode: RawNode): Node {
    const nodes = rawNode.nodes ? rawNode.nodes.map(node => RawModelConverter.convertToNode(node)) : []
    const edges = rawNode.edges ? rawNode.edges.map(edge => RawModelConverter.convertToEdge(edge)) : []
    const props = rawNode.props ? JSON.parse(JSON.stringify(rawNode.props)) : undefined
    return new Node(rawNode.id, nodes, edges, props)
  }

  static convertToEdge(rawEdge: RawEdge): Edge {
    const props = rawEdge.props ? JSON.parse(JSON.stringify(rawEdge.props)) : undefined
    return new Edge(rawEdge.sourceId, rawEdge.targetId, props)
  }
}
