import { Node, Edge, Props } from './nodeModel'

export interface RawNode {
  name: string,
  kind: string,
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
    const props = rawNode.props ? JSON.parse(JSON.stringify(rawNode.props)) : undefined
    const node = new Node(rawNode.name, rawNode.kind, nodes, null, props)
    if (rawNode.edges) {
      rawNode.edges.forEach(rawEdge => RawModelConverter.addAsEdge(rawEdge, node))
    }
    return node
  }

  private static addAsEdge(rawEdge: RawEdge, ownerNode: Node) {
    const props = rawEdge.props ? JSON.parse(JSON.stringify(rawEdge.props)) : undefined
    const source = ownerNode.deepFindNodeById(rawEdge.sourceId)
    const target = ownerNode.deepFindNodeById(rawEdge.targetId)
    ownerNode.addEdge(new Edge(source, target, props))
  }
}
