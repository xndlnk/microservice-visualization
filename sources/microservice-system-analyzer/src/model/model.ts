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

  constructor(name: string, nodes?: Node[], edges?: Edge[], properties?: Properties) {
    this.name = name
    this.type = this.constructor.toString().match(/\w+/g)[1]
    this.nodes = nodes || []
    this.edges = edges || []
    this.properties = properties || {}
  }

  addNodeUniquely(node: Node): boolean {
    if (this.deepFindNodeById(node.getId())) return false

    this.nodes.push(node)
    return true
  }

  addEdgeUniquely(newEdge: Edge) {
    const existing = this.edges.find(edge => edge.getSource().getId() === newEdge.getSource().getId() && edge.getTarget().getId() === newEdge.getTarget().getId())
    if (!existing) {
      this.edges.push(newEdge)
    }
  }

  deepFindNodeById(id: string): Node {
    const node = this.getNodes().find(node => node.getId() === id)
    if (node) {
      return node
    } else {
      return this.getNodes().map(node => node.deepFindNodeById(id)).find(node => node !== undefined)
    }
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
    super(name, nodes, edges, properties)
  }
}

export class Microservice extends Node {
  constructor(name: string, properties?: Properties) {
    super(name, null, null, properties)
  }
}

export class MessageExchange extends Node {
  constructor(name: string, properties?: Properties) {
    super(name, null, null, properties)
  }
}

export class Edge {
  private properties: Properties = {}
  private source: Node
  private target: Node
  private sourceId: string
  private targetId: string
  private type: string

  constructor(source: Node, target: Node) {
    this.source = source
    this.target = target
    this.sourceId = source.getId()
    this.targetId = target.getId()
    this.type = this.constructor.toString().match(/\w+/g)[1]
  }

  getSource() {
    return this.source
  }

  getTarget() {
    return this.target
  }

  getProperties(): Properties {
    return this.properties
  }

  addProperty(name: string, value: any) {
    this.properties[name] = value
  }
}

export class InfoFlow extends Edge {}
export class AsyncInfoFlow extends InfoFlow {}
export class SyncInfoFlow extends InfoFlow {}
