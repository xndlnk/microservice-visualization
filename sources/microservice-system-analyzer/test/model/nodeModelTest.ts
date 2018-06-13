// DEPRECATED: this module is part of a prototype and might be removed again.

import { describe, it, test } from 'mocha'
import { expect } from 'chai'

import { Node, Edge } from '~/model/nodeModel'
import { RawNode, RawEdge, RawModelConverter } from '~/model/rawNodeModel'

/* tslint:disable:no-unused-expression */
describe('node model', function() {

  test('basic operations', function() {
    const emptySystem = new Node('S', 'system')
    expect(emptySystem.hasNodes()).to.be.false
    expect(emptySystem.hasEdges()).to.be.false

    const nodeA = new Node('A', 'microservice')
    const nodeB = new Node('B', 'microservice')
    const system: Node = new Node('S', 'system',
      [ nodeA, nodeB ],
      [ new Edge(nodeA, nodeB) ])

    expect(system.getNodes().length).to.equal(2)
    expect(system.hasNodes()).to.be.true
    expect(system.deepFindNodeByNameAndKind('A', 'microservice')).to.deep.equal(new Node('A', 'microservice'))

    expect(system.getEdges().length).to.equal(1)
    expect(system.hasEdges()).to.be.true
  })

  test('props are always accessible', function() {
    const node = new Node('S', 'system')

    expect(node.getProps()).not.to.be.undefined
    expect(node.getProps().x).to.be.undefined

    node.getProps().x = 'x'
    expect(node.getProps().x).to.equal('x')
  })
})
