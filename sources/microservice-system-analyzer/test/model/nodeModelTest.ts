import { describe, it } from 'mocha'
import { expect } from 'chai'
import { Node, Edge } from '~/model/nodeModel'

/* eslint-disable no-unused-expressions */
describe('node model', function() {
  it('adds the same service just once', function() {
    const system = new Node('system', [ new Node('A'), new Node('B') ])

    expect(system.getNodes().length).to.equal(2)
  })
})
