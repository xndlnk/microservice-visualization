import * as _ from 'lodash'

export interface Element {
  getProperties(): Properties
}

export interface Properties {
  [key: string]: any
}

export interface Node extends Element {
  getId(): string
  getNodes(): Node[]
  getEdges(): Edge[]
}

export interface Edge extends Element {
  getSource(): Node
  getTarget(): Node
}

abstract class BasicNode implements Node {
  private name: string
  private nodes: Node[] = []
  private edges: Edge[] = []
  private properties: Properties = {}
  private type: string

  constructor(name: string) {
    this.name = name
    this.type = this.constructor.toString().match(/\w+/g)[1]
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
}

export class System extends BasicNode {
  private services: Microservice[] = []
  private exchanges: MessageExchange[] = []
  private infoFlows: InfoFlow[] = []
  private subSystems: System[] = []

  constructor(name: string) {
    super(name)
  }

  getNodes(): Node[] {
    return _.union(this.services as Node[], this.exchanges as Node[])
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
  constructor(name: string) {
    super(name)
  }
}

export class MessageExchange extends BasicNode {
  constructor(name: string) {
    super(name)
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
}

export class InfoFlow extends BasicEdge {}
export class AsyncInfoFlow extends InfoFlow {}
export class SyncInfoFlow extends InfoFlow {}
