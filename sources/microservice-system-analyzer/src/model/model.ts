import * as _ from 'lodash'
import { constants } from 'http2'

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

abstract class LeafNode implements Node {
  private properties: Properties

  abstract getId(): string

  getNodes(): Node[] {
    return []
  }

  getEdges(): Edge[] {
    return []
  }

  getProperties(): Properties {
    return this.properties
  }
}

abstract class NamedElement {
  private name: string

  getName(): string {
    return this.name
  }
}

export class System implements Node {
  private name: string
  private services: Microservice[] = []
  private exchanges: MessageExchange[] = []
  private links: Link[]
  private subSystems: System[]

  constructor(name: string) {
    this.name = name
  }

  getId(): string {
    return 'system_' + this.name
  }

  getNodes(): Node[] {
    return _.union(this.services as Node[], this.exchanges as Node[])
  }

  getEdges(): Edge[] {
    return []
  }

  getProperties(): Properties {
    return []
  }

  getMicroservices(): Microservice[] {
    return this.services
  }

  getMessageExchanges(): MessageExchange[] {
    return this.exchanges
  }
}

export class Microservice extends LeafNode {
  private name: string

  constructor(name: string) {
    super()
    this.name = name
  }

  getName(): string {
    return this.name
  }

  getId(): string {
    return 'Microservice_' + this.name
  }
}

export class MessageExchange extends LeafNode {
  private name: string

  constructor(name: string) {
    super()
    this.name = name
  }

  getName(): string {
    return this.name
  }

  getId(): string {
    return 'MessageExchange_' + this.name
  }
}

export declare interface Link {
  sourceName: string
  targetName: string
  communicationType: string
}
