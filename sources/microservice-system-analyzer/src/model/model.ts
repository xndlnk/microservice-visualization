import * as _ from 'lodash'

// INFO: this model will replace the old one in modelClasses.js

export interface Element {
  getProperties(): Properties
  addProperty(name: string, value: any)
}

export interface Properties {
  [key: string]: any
}

export interface Node extends Element {
  getId(): string
  getNodes(): Node[]
  getEdges(): Edge[]
  deepFindNodeById(id: string): Node
}

export interface Edge extends Element {
  getSource(): Node
  getTarget(): Node
}

abstract class BasicNode implements Node {
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

  addNodeUniquely(node: Node, addNode: (n: Node) => void) {
    const existing = this.deepFindNodeById(node.getId())
    if (!existing) {
      addNode(node)
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

export class System extends BasicNode {
  private services: Microservice[] = []
  private exchanges: MessageExchange[] = []
  private infoFlows: InfoFlow[] = []
  private subSystems: System[] = []

  constructor(name: string) {
    super(name)
  }

  addMicroserviceUniquely(microservice: Microservice) {
    this.addNodeUniquely(microservice, (m: Microservice) => this.services.push(m))
  }

  addMessageExchangeUniquely(exchange: MessageExchange) {
    this.addNodeUniquely(exchange, (e: MessageExchange) => this.exchanges.push(e))
  }

  getNodes(): Node[] {
    return _.union(this.services as Node[], this.exchanges as Node[], this.subSystems as Node[])
  }

  getEdges(): Edge[] {
    return this.infoFlows
  }

  getMicroservices(): Microservice[] {
    return this.services
  }

  getMessageExchanges(): MessageExchange[] {
    return this.exchanges
  }

  getSubSystems(): System[] {
    return this.subSystems
  }

  getInfoFlows(): InfoFlow[] {
    return this.infoFlows
  }
}

export class Microservice extends BasicNode {
  constructor(name: string, properties?: Properties) {
    super(name, null, null, properties)
  }
}

export class MessageExchange extends BasicNode {
  constructor(name: string, properties?: Properties) {
    super(name, null, null, properties)
  }
}

abstract class BasicEdge implements Edge {
  private properties: Properties = {}
  private source: Node
  private target: Node
  private sourceId: string
  private targetId: string
  private type: string

  constructor(source: Node, target: Node) {
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

export class InfoFlow extends BasicEdge {}
export class AsyncInfoFlow extends InfoFlow {}
export class SyncInfoFlow extends InfoFlow {}
