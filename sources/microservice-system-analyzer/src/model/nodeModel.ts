export interface Props {
  [key: string]: any
}

export class Node {
  public readonly id: string
  public props: Props

  private nodes: Node[]
  private edges: Edge[]

  constructor(id: string, nodes?: Node[], edges?: Edge[], props?: Props) {
    this.id = id
    this.props = props ? props : {}
    this.nodes = nodes ? nodes : []
    this.edges = edges ? edges : []
  }

  // TODO: getters for specific props should move to specific users
  // and not be part of generic model
  getKind(): string {
    return this.getPropOrElse('kind', 'node')
  }

  getLabel(): string {
    return this.getPropOrElse('label', this.id)
  }

  findNode(id: string): Node {
    return this.nodes.find(node => node.id === id)
  }

  findEdge(sourceId: string, targetId: string): Edge {
    return this.edges.find(edge => edge.sourceId === sourceId && edge.targetId === targetId)
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

  getPropOrElse(propName: string, alternativeValue: any): any {
    const value = this.props ? this.props[propName] : undefined
    return value ? value : alternativeValue
  }
}

export class Edge {
  public readonly sourceId: string
  public readonly targetId: string
  public props: Props

  constructor(sourceId: string, targetId: string, props?: Props) {
    this.sourceId = sourceId
    this.targetId = targetId
    this.props = props ? props : {}
  }
}
