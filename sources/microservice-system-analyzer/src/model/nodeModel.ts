// DEPRECATED: this module is part of a prototype and might be removed again.

export interface Props {
  [key: string]: any
}

export class Node {
  public readonly props: Props

  private readonly id: string
  private readonly name: string
  private readonly kind: string

  private nodes: Node[]
  private edges: Edge[]

  constructor(name: string, kind: string, nodes?: Node[], edges?: Edge[], props?: Props) {
    this.id = `${kind}_${name}`
    this.name = name
    this.kind = kind
    this.props = props ? props : {}
    this.nodes = nodes ? nodes : []
    this.edges = edges ? edges : []
  }

  // TODO: getters for specific props should move to specific users
  // and not be part of generic model
  getLabel(): string {
    return this.getPropOrElse('label', `${this.kind} ${this.name}`)
  }

  addNodeIfNew(name: string, kind: string): Node {
    const existingNode = this.deepFindNodeByNameAndKind(name, kind)
    if (existingNode) return existingNode

    const newNode = new Node(name, kind)
    this.nodes.push(newNode)
    return newNode
  }

  addEdge(edge: Edge) {
    this.edges.push(edge)
  }

  findNodeById(id: string): Node {
    return this.nodes.find(node => node.id === id)
  }

  deepFindNodeById(id: string): Node {
    const node = this.nodes.find(node => node.id === id)
    if (node) {
      return node
    } else {
      return this.nodes.map(node => node.deepFindNodeById(id)).find(node => node !== undefined)
    }
  }

  deepFindNodeByNameAndKind(name: string, kind: string): Node {
    const node = this.nodes.find(node => node.name === name && node.kind === kind)
    if (node) {
      return node
    } else {
      return this.nodes.map(node => node.deepFindNodeByNameAndKind(name, kind)).find(node => node !== undefined)
    }
  }

  getProps(): Props {
    return this.props
  }

  getId(): string {
    return this.id
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
  public props: Props

  private source: Node
  private target: Node

  constructor(source: Node, target: Node, props?: Props) {
    this.source = source
    this.target = target
    this.props = props ? props : {}
  }

  getSource() {
    return this.source
  }

  getTarget() {
    return this.target
  }
}
