abstract class StructuredElement {
  protected props: Props

  constructor(props?: Props) {
    this.props = props ? props : {}
  }

  getProps(): Props {
    return this.props
  }

  getProp(propName: string, alternativeValue: any): any {
    const value = this.props ? this.props[propName] : undefined
    return value ? value : alternativeValue
  }
}

export interface Props {
  [key: string]: any
}

export class Node extends StructuredElement {
  public readonly id: string

  private nodes: Node[]
  private edges: Edge[]

  constructor(id: string, nodes?: Node[], edges?: Edge[], props?: Props) {
    super(props)
    this.id = id
    this.nodes = nodes ? nodes : []
    this.edges = edges ? edges : []
  }

  sameId(otherId: string): boolean {
    return this.id === otherId
  }

  // TODO: getters for specific props should move to specific users
  // and not be part of generic model
  getKind(): string {
    return this.getProp('kind', 'node')
  }

  getLabel(): string {
    return this.getProp('label', this.id)
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

  getProps(): Props {
    return this.props
  }

  getProp(propName: string, alternativeValue: any): any {
    const value = this.props ? this.props[propName] : undefined
    return value ? value : alternativeValue
  }
}

export class Edge extends StructuredElement {
  public readonly sourceId: string
  public readonly targetId: string

  constructor(sourceId: string, targetId: string, props?: Props) {
    super(props)
    this.sourceId = sourceId
    this.targetId = targetId
  }
}
