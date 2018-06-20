import { describe, it } from 'mocha'
import { expect } from 'chai'
import * as _ from 'lodash'
import { Node, System, Microservice, MessageExchange, AsyncInfoFlow, SyncInfoFlow } from '~/model/model'
import { mergeSystems } from '~/processor/ServiceExchangeMerger'

/* tslint:disable:no-unused-expression */
describe('service exchange merger', function() {

  it('can merge services that are linked with an equally named exchange into just one node', function() {
    const consulSystem = new System('S',
      ['A', 'B', 'C', 'D', 'E'].map(name => new Microservice(name)))

    const rabbitImporter: System = Node.ofEdgesWithNodes('S', [
      new AsyncInfoFlow(new MessageExchange('A'), new Microservice('B')),
      new AsyncInfoFlow(new MessageExchange('P'), new Microservice('D')),
      new AsyncInfoFlow(new MessageExchange('B'), new Microservice('E'))
    ])

    const sendToImporter: System = Node.ofEdgesWithNodes('S', [
      new AsyncInfoFlow(new Microservice('A'), new MessageExchange('A')),
      new AsyncInfoFlow(new Microservice('B'), new MessageExchange('P')),
      new AsyncInfoFlow(new Microservice('C'), new MessageExchange('P')),
      new AsyncInfoFlow(new Microservice('D'), new MessageExchange('B'))
    ])

    const mergedSystem = mergeSystems([
      consulSystem,
      rabbitImporter,
      Node.ofEdgesWithNodes('S', [
        new SyncInfoFlow(new Microservice('A'), new Microservice('F')),
        new SyncInfoFlow(new Microservice('B'), new Microservice('F'))
      ]),
      sendToImporter
    ])

    const expectedMicroservices = ['A', 'B', 'C', 'D', 'E', 'F'].map(name => new Microservice(name))
    const expectedExchanges = ['P', 'B'].map(name => new MessageExchange(name))

    expect(mergedSystem.getNodes()).to.have.deep.members(
      _.union(expectedMicroservices, expectedExchanges))

    expect(mergedSystem.getEdges()).to.have.deep.members([
      new AsyncInfoFlow(new Microservice('A'), new Microservice('B')),
      new AsyncInfoFlow(new Microservice('B'), new MessageExchange('P')),
      new AsyncInfoFlow(new Microservice('C'), new MessageExchange('P')),
      new AsyncInfoFlow(new MessageExchange('P'), new Microservice('D')),
      new AsyncInfoFlow(new Microservice('D'), new MessageExchange('B')),
      new AsyncInfoFlow(new MessageExchange('B'), new Microservice('E')),
      new SyncInfoFlow(new Microservice('A'), new Microservice('F')),
      new SyncInfoFlow(new Microservice('B'), new Microservice('F'))
    ])
  })
})
