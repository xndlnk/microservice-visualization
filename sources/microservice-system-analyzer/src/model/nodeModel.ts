export interface NodeTO {
  id: string
  nodes?: NodeTO[]
  edges?: EdgeTO[]
  props?: Props
}

export interface EdgeTO {
  sourceId: string
  targetId: string
  props?: Props
}

export interface Props {
  [key: string]: any
}

export class Node {
  public readonly id: string
  
  private kind?: string
  private nodes: Node[]
  private edges: Edge[]
  private props: Props

  constructor(id: string, nodes?: Node[], edges?: Edge[], props?: Props) {
    this.id = id
    this.nodes = nodes ? nodes : []
    this.edges = edges ? edges : []
    this.props = props
  }

  static ofNodeTO(nodeTO: NodeTO): Node {
    let nodes = nodeTO.nodes ? nodeTO.nodes.map(node => Node.ofNodeTO(node)) : []
    let edges = nodeTO.edges ? nodeTO.edges.map(edge => Edge.ofEdgeTO(edge)) : []
    let props = nodeTO.props ? JSON.parse(JSON.stringify(nodeTO.props)) : undefined
    return new Node(nodeTO.id, nodes, edges, props)
  }

  deepResolveNodeReferences() {
    // TODO:
  }

  sameId(otherId: string): boolean {
    return this.id === otherId
  }

  getLabel(): string {
    return this.props.label ? this.props.label : this.id
  }

  getNodes(): Node[] {
    return this.nodes
  }

  hasNodes(): boolean {
    return this.nodes.length > 0
  }

  getEdges(): Edge[] {
    return this.edges
  }

  hasEdges(): boolean {
    return this.edges.length > 0
  }

  getProps(): Props {
    return this.props
  }

  getProp(propName: string, alternativeValue: any): any {
    let value = this.props ? this.props[propName] : undefined
    return value ? value : alternativeValue
  }
}

export class Edge {
  public readonly sourceId: string
  public readonly targetId: string

  private source: Node = null
  private target: Node = null
  private kind?: string

  private props: Props

  constructor(sourceId: string, targetId: string, props?: Props) {
    this.sourceId = sourceId
    this.targetId = targetId
    this.props = props
  }

  static ofEdgeTO(edgeTO: EdgeTO): Edge {
    let props = edgeTO.props ? JSON.parse(JSON.stringify(edgeTO.props)) : undefined
    return new Edge(edgeTO.sourceId, edgeTO.targetId, props)
  }
}
