import { System } from './ms'
import { TypedNode } from './core-typed'

class TestNode extends TypedNode<{ name: string }> {
}

describe('core-typed', () => {

  it('add named node only once and extend payload', () => {
    const system = new System('test')

    const node = system.addOrExtendNamedNode<TestNode>(TestNode, 'name')
    system.addOrExtendNamedNode<TestNode>(TestNode, 'name', { p1: '1' })
    system.addOrExtendNamedNode<TestNode>(TestNode, 'name', { p2: '2' })

    expect(system.nodes).toHaveLength(1)
    expect(node.getPayload().name).toEqual('name')
    expect(system.findNodeWithNameInPayload<TestNode>(TestNode, 'name')).toBeDefined()

    expect(node.content.payload.p1).toEqual('1')
    expect(node.content.payload.p2).toEqual('2')
  })
})
