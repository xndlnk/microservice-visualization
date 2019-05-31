import { TypedNode, TypedEdge } from './core-typed'
import { Node } from './core'

/**
 * this model provides type-safe access to nodes in a microservice system.
 */

export class System extends TypedNode<NamePayload> {

  constructor(id: string, transformerName?: string) {
    super(id, { name: id }, transformerName, System.name)
  }

  // TODO: these public methods could be generated from a model definition in the future

  public addMicroService(name: string, extraPayload: any = {}, transformerName?: string): MicroService {
    return this.addOrExtendNamedNode<MicroService>(MicroService, name, extraPayload, transformerName)
  }

  public getMicroServices(): MicroService[] {
    return this.getNodes<MicroService>(MicroService)
  }

  public findMicroService(name: string): MicroService {
    return this.findNodeWithNameInPayload<MicroService>(MicroService, name)
  }

  public addMessageExchange(name: string, extraPayload: any = {}, transformerName?: string): MessageExchange {
    return this.addOrExtendNamedNode<MessageExchange>(MessageExchange, name, extraPayload, transformerName)
  }

  public getMessageExchanges(): MessageExchange[] {
    return this.getNodes<MessageExchange>(MessageExchange)
  }

  public findMessageExchange(name: string): MessageExchange {
    return this.findNodeWithNameInPayload<MessageExchange>(MessageExchange, name)
  }

  public getSyncDataFlows(): SyncDataFlow[] {
    return this.getEdges<SyncDataFlow>(SyncDataFlow)
  }

  public getAsyncEventFlows(): AsyncEventFlow[] {
    return this.getEdges<AsyncEventFlow>(AsyncEventFlow)
  }
}

export class MicroService extends TypedNode<MicroServicePayload> {
  constructor(id: string, payload: MicroServicePayload, transformerName?: string) {
    super(id, payload, transformerName, MicroService.name)
  }
}

export class MicroServicePayload {
  name: string
  cabinet?: string
  tenant?: string
  env?: EnvEntry[]
  labels?: any
  sourceLocation?: string
}

type EnvEntry = {
  name: string,
  value: string
}

export class MessageExchange extends TypedNode<NamePayload> {
  constructor(id: string, payload: NamePayload, transformerName?: string) {
    super(id, payload, transformerName, MessageExchange.name)
  }
}

export class NamePayload {
  name: string
}

type AsyncEventFlowPayload = {
  routingKey: string
}

// TODO: can this be simplified? too much boilerplate code for constructor
export class AsyncEventFlow extends TypedEdge<AsyncEventFlowPayload> {
  constructor(source: Node, target: Node, payload?: AsyncEventFlowPayload, transformerName?: string) {
    super(source, target, payload, transformerName, AsyncEventFlow.name)
  }
}

type SyncDataFlowPayload = {
  definedEndpoints: Endpoint[]
}

type Endpoint = {
  path: string
}

export class SyncDataFlow extends TypedEdge<SyncDataFlowPayload> {
  constructor(source: Node, target: Node, payload?: SyncDataFlowPayload, transformerName?: string) {
    super(source, target, payload, transformerName, SyncDataFlow.name)
  }
}
