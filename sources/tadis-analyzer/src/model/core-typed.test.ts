import { System, NamePayload, MessageExchange } from './ms'
import { TypedNode } from './core-typed'
import { Metadata, Content } from './core'

class TestNode extends TypedNode<NamePayload> {
  constructor(id: string, payload: NamePayload, metadata: Metadata) {
    super(id, payload, metadata, TestNode.name)
  }
}

describe('core-typed', () => {

  it('add named node only once and extend payload', () => {
    const system = new System('test')

    const node = system.addOrExtendNamedNode<TestNode>(TestNode, 'name')
    system.addOrExtendNamedNode<TestNode>(TestNode, 'name', { p1: '1' })
    system.addOrExtendNamedNode<TestNode>(TestNode, 'name', { p2: '2' })

    expect(system.nodes).toHaveLength(1)
    expect(node.getPayload().name).toEqual('name')
    expect(system.findTypedNodeWithName<TestNode>(TestNode, 'name')).toBeDefined()

    expect(node.content.payload.p1).toEqual('1')
    expect(node.content.payload.p2).toEqual('2')
  })

  it.skip('adds nodes with an object of the given type', () => {
    const system = new System('test')

    const node = system.addOrExtendTypedNode(MessageExchange.name, 'name', undefined)

    expect(node.getName()).toEqual('name')
    expect((node as TypedNode<NamePayload>).getPayload().name).toEqual('name')
  })
})
