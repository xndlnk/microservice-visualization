import * as _ from 'lodash'

// INFO: this model will replace the old one in modelClasses.js

export interface Properties {
  [key: string]: any
}

export class Node {
  private name: string
  private nodes: Node[]
  private edges: Edge[]
  private properties: Properties
  private type: string

  constructor(name: string, type?: string, nodes?: Node[], edges?: Edge[], properties?: Properties) {
    this.name = name
    this.type = type || 'Node'
    this.nodes = nodes || []
    this.edges = edges || []
    this.properties = properties || {}
  }

  static ofEdgesWithNodes(name: string, edges: Edge[]): Node {
    const node = new Node(name)
    edges.forEach(edge => node.addEdgeWithNodesUniquely(edge))
    return node
  }

  addNodeUniquely(node: Node): boolean {
    const existingNode = this.deepFindNodeById(node.getId())
    if (existingNode) {
      Object.getOwnPropertyNames(node.getProperties())
        .forEach(propName => existingNode.addProperty(propName, node.getProperties()[propName]))
      return false
    }

    this.nodes.push(node)
    return true
  }

  addNodeUniquelyAndReturn(node: Node): Node {
    const existingNode = this.deepFindNodeById(node.getId())
    if (existingNode) return existingNode

    this.nodes.push(node)
    return node
  }

  addEdgeUniquely(newEdge: Edge) {
    const existing = this.edges.find(edge => edge.getSource().getId() === newEdge.getSource().getId()
      && edge.getTarget().getId() === newEdge.getTarget().getId())
    if (!existing) {
      const actualSource = this.deepFindNodeById(newEdge.getSource().getId()) || newEdge.getSource()
      const actualTarget = this.deepFindNodeById(newEdge.getTarget().getId()) || newEdge.getTarget()
      newEdge.setSource(actualSource)
      newEdge.setTarget(actualTarget)
      this.edges.push(newEdge)
    }
  }

  addEdgeWithNodesUniquely(newEdge: Edge) {
    this.addNodeUniquely(newEdge.getSource())
    this.addNodeUniquely(newEdge.getTarget())
    this.addEdgeUniquely(newEdge)
  }

  deepFindNodeById(id: string): Node {
    const node = this.findNodeById(id)
    if (node) {
      return node
    } else {
      return this.getNodes().map(node => node.deepFindNodeById(id)).find(node => node !== undefined)
    }
  }

  findNodeById(id: string): Node {
    return this.getNodes().find(node => node.getId() === id)
  }

  containsNode(id: string): boolean {
    return this.findNodeById(id) !== undefined
  }

  getName(): string {
    return this.name
  }

  getId(): string {
    return this.getType() + '_' + this.name
  }

  getType(): string {
    return this.type
  }

  getNodes(): Node[] {
    return this.nodes
  }

  getEdges(): Edge[] {
    return this.edges
  }

  getProperties(): Properties {
    return this.properties
  }

  addProperty(name: string, value: any) {
    this.properties[name] = value
  }
}

export class System extends Node {
  constructor(name: string, nodes?: Node[], edges?: Edge[], properties?: Properties) {
    super(name, 'System', nodes, edges, properties)
  }
}

export class Microservice extends Node {
  constructor(name: string, properties?: Properties) {
    super(name, 'Microservice', null, null, properties)
  }
}

export class MessageExchange extends Node {
  constructor(name: string, properties?: Properties) {
    super(name, 'MessageExchange', null, null, properties)
  }
}

export class Edge {
  private properties: Properties = {}
  private source: Node
  private target: Node
  private type: string

  constructor(source: Node, target: Node, type?: string, properties?: Properties) {
    this.source = source
    this.target = target
    this.type = type || 'Edge'
    this.properties = properties
  }

  setSource(source: Node) {
    this.source = source
  }

  getSource() {
    return this.source
  }

  setTarget(target: Node) {
    this.target = target
  }

  getTarget() {
    return this.target
  }

  getType() {
    return this.type
  }

  getProperties(): Properties {
    return this.properties
  }

  addProperty(name: string, value: any) {
    this.properties[name] = value
  }
}

export class InfoFlow extends Edge {
  constructor(source: Node, target: Node, type?: string) {
    super(source, target, type || 'InfoFlow')
  }
}

export class AsyncInfoFlow extends InfoFlow {
  constructor(source: Node, target: Node) {
    super(source, target, 'AsyncInfoFlow')
  }
}

export class SyncInfoFlow extends InfoFlow {
  constructor(source: Node, target: Node) {
    super(source, target, 'SyncInfoFlow')
  }
}
