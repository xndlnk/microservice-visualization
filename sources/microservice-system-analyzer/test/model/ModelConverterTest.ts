import { describe, it } from 'mocha'
import { expect } from 'chai'
import { Node, Edge } from '~/model/nodeModel'
import { RawNode, RawEdge, RawModelConverter } from '~/model/rawNodeModel'
import { System, Service, Link, Property } from './modelClasses'
import { ModelConverter } from '~/model/ModelConverter'

/* tslint:disable:no-unused-expression */
describe('model converter', function() {

  it('can convert services and links', function() {
    const system: System = {
      name: 'system',
      services: [
        { name: 'A' },
        { name: 'B' }
      ],
      links: [
        { sourceName: 'A', targetName: 'B', communicationType: 'async' }
      ]
    }

    const node = new ModelConverter().convertSystemToNode(system)

    const expectedNode: Node = RawModelConverter.convertToNode({
      id: 'system',
      nodes: [
        { id: 'A' },
        { id: 'B' }
      ],
      edges: [
        { sourceId: 'A', targetId: 'B', props: { communicationType: 'async' } }
      ]
    })

    expect(node).to.deep.equal(expectedNode)
  })
})
