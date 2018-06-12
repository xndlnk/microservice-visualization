import { describe, it, test } from 'mocha'
import { expect } from 'chai'

import { Node, Edge, System, Microservice, MessageExchange } from '~/model/model'

/* tslint:disable:no-unused-expression */
describe('model', function() {

  test('basic operations', function() {
    const a = new Microservice('A')
    const b = new MessageExchange('B')
    const system = new System('S')
    system.getMicroservices().push(a)
    system.getMessageExchanges().push(b)

    expect(system.getNodes().length).to.equal(2)
    expect(system.getNodes().map(node => node.getId())).to.eql([ 'Microservice_A', 'MessageExchange_B' ])
  })
})
