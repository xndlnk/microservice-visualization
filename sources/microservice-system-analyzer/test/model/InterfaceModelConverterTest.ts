import { describe, test } from 'mocha'
import { expect } from 'chai'

import { System, Microservice, MessageExchange, AsyncInfoFlow } from '~/model/model'
import { InterfaceModelConverter } from '~/model/InterfaceModelConverter'

/* tslint:disable:no-unused-expression */
describe('model serializer', function() {

  test('serialize typed nodes', function() {
    const a = new Microservice('A', { p1: 'v1' })
    const b = new MessageExchange('B')
    const system = new System('S', [ a, b ], [ new AsyncInfoFlow(a, b) ])

    const interfaceSystem = new InterfaceModelConverter().convertNode(system)

    expect(interfaceSystem).to.eql({
      id: system.getId(),
      name: 'S',
      type: 'System',
      nodes: [
        {
          id: a.getId(),
          name: 'A',
          type: 'Microservice',
          properties: { p1: 'v1' }
        },
        {
          id: b.getId(),
          name: 'B',
          type: 'MessageExchange'
        }
      ],
      edges: [
        {
          sourceId: a.getId(),
          targetId: b.getId(),
          type: 'AsyncInfoFlow'
        }
      ]
    })
  })
})
