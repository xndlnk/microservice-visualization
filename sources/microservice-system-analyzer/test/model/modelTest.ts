import { describe, it, test } from 'mocha'
import { expect } from 'chai'

import { Node, Edge, System, Microservice, MessageExchange, AsyncInfoFlow } from '~/model/model'

/* tslint:disable:no-unused-expression */
describe('model', function() {

  test('basic operations', function() {
    const a = new Microservice('A')
    const b = new MessageExchange('B')
    const system = new System('S', [ a, b ], [ new AsyncInfoFlow(a, b) ])

    expect(system.getNodes().length).to.equal(2)
    expect(system.getNodes().map(node => node.getId())).to.eql([ 'Microservice_A', 'MessageExchange_B' ])
    expect(system.getEdges()).to.deep.equal([ new AsyncInfoFlow(a, b) ])
  })

  test('unique node additions', function() {
    const system = new System('S')

    system.addNodeUniquely(new Microservice('A'))
    system.addNodeUniquely(new Microservice('A'))
    expect(system.getNodes().length).to.equal(1)

    system.addNodeUniquely(new MessageExchange('A'))
    system.addNodeUniquely(new MessageExchange('A'))
    expect(system.getNodes().length).to.equal(2)

    expect(system.containsNode('Microservice_A')).to.be.true
    expect(system.containsNode('Microservice_X')).to.be.false
  })

  test('unique edge additions', function() {
    const system = new System('S')

    const nodeA = new Node('A')
    const nodeB = new Node('B')
    const nodeC = new Node('C')

    system.addEdgeWithNodesUniquely(new Edge(nodeA, nodeB))
    system.addEdgeWithNodesUniquely(new Edge(nodeA, nodeB))
    system.addEdgeWithNodesUniquely(new Edge(new Node('A'), nodeC))

    expect(system.getNodes().length).to.equal(3)
    expect(system.getEdges().length).to.equal(2)
    expect(system.getEdges().filter(edge => edge.getSource() === nodeA).length).to.equal(2)
  })
})
