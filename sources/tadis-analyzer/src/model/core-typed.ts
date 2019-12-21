import { Logger } from '@nestjs/common'

import { Node, Content, Edge, Metadata } from './core'

// tslint:disable-next-line
import * as ms from './ms'

const logContext = 'core-typed'

export class TypedNode<Payload> extends Node {

  constructor(id: string, payload: Payload, metadata: Metadata, typeName: string) {
    super(id, new Content(typeName, metadata, payload))
  }

  public getNodes<NodeType extends Node>(type: Type<NodeType>): NodeType[] {
    return this.nodes
      .filter(node => node.content.type === type.name)
      .map(node => node as NodeType)
  }

  public addOrExtendTypedNode(
    type: string, name: string, extraPayload: any = {}, metadata?: Metadata): Node {

    const node = this.ensureContainsNodeOfTypeAndName(type, name, extraPayload, metadata)

    // TODO: does not work for methods inherited from TypedNode
    Object.assign(node, new ms[type](node.id, node.content.payload, metadata))

    return node
  }

  public addOrExtendNamedNode<NodeType extends TypedNode<Payload>>(
    type: TypeExtendsTypedNode<NodeType, Payload>, name: string, extraPayload: any = {}, metadata?: Metadata): NodeType {

    const existingNode = this.findTypedNodeWithName<NodeType>(type, name)
    if (existingNode) {
      if (extraPayload) {
        Object.getOwnPropertyNames(extraPayload)
          .forEach(payloadPropertyName => existingNode.content.payload[payloadPropertyName] = extraPayload[payloadPropertyName])
      }
      return existingNode
    }

    const node = new type(this.id + '__' + type.name + '_' + name, { name, ...extraPayload }, metadata,
      // keep type name as last parameter because classes inheriting from TypedNode omit the type name
      // in their own constructors.
      type.name)
    if (node.content.type !== type.name) {
      Logger.error('created node of type ' + type.name + ' but type was not set in content.', null, logContext)
    }
    this.nodes.push(node)
    return node
  }

  public findTypedNodeWithName<NodeType extends TypedNode<Payload>>(
    type: Type<NodeType>, name: string): NodeType {
    return this.findNodeOfTypeWithName(type.name, name) as NodeType
  }

  public getEdges<EdgeType extends Edge>(type: Type<EdgeType>): EdgeType[] {
    return this.edges
      .filter(edge => edge.content.type === type.name)
      .map(edge => edge as EdgeType)
  }

  public getPayload(): Payload {
    return this.content.payload as Payload
  }
}

export function createEdge<Payload>(
  payloadType: Type<Payload>, source: Node, target: Node, payload?: Payload, metadata?: Metadata
): TypedEdge<Payload> {
  return new TypedEdge<Payload>(source, target, payload, metadata, payloadType.name)
}

export class TypedEdge<Payload> extends Edge {

  constructor(source: Node, target: Node, payload: Payload, metadata: Metadata, typeName: string) {
    super(source, target, new Content(typeName, metadata, payload))
  }

  public getPayload(): Payload {
    return this.content.payload as Payload
  }
}

interface Type<T> extends Function {
  new(...args: any[]): T
}

interface TypeExtendsTypedNode<Type, Payload> extends Function {
  new(id: string, payload: Payload, metadata: Metadata, typeName: string): Type
}
