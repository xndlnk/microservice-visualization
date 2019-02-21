import { describe, it } from 'mocha'
import { expect } from 'chai'
import * as _ from 'lodash'
import { Node, Microservice, MessageExchange, AsyncInfoFlow } from '~/model/model'
import { ServiceExchangeMerger } from '~/processor/ServiceExchangeMerger'

/* tslint:disable:no-unused-expression */
describe('service exchange merger', function() {

  it('can merge in standard case', function() {
    const system = Node.ofEdgesWithNodes('S', [
      new AsyncInfoFlow(new Microservice('A'), new Microservice('B')),
      new AsyncInfoFlow(new Microservice('B'), new MessageExchange('B')),
      new AsyncInfoFlow(new MessageExchange('B'), new Microservice('C'))
    ])

    const mergedSystem = new ServiceExchangeMerger().mergeServiceAndExchangeOfSameNameToService(system)

    expect(mergedSystem.getNodes()).to.have.deep.members([
      new Microservice('A'), new Microservice('B'), new Microservice('C')
    ])
    expect(mergedSystem.getEdges()).to.have.deep.members([
      new AsyncInfoFlow(new Microservice('A'), new Microservice('B')),
      new AsyncInfoFlow(new Microservice('B'), new Microservice('C'))
    ])
  })

  it('merges properties of service and exchange', function() {
    const serviceToMerge = new Microservice('B', { p: 1 })
    const exchangeToMerge = new MessageExchange('B', { q: 2 })
    const mergeResult = new Microservice('B', { p: 1, q: 2 })

    const system = Node.ofEdgesWithNodes('S', [
      new AsyncInfoFlow(new Microservice('A'), serviceToMerge),
      new AsyncInfoFlow(serviceToMerge, exchangeToMerge),
      new AsyncInfoFlow(exchangeToMerge, new Microservice('C'))
    ])

    const mergedSystem = new ServiceExchangeMerger().mergeServiceAndExchangeOfSameNameToService(system)

    expect(mergedSystem.getNodes()).to.have.deep.members([
      new Microservice('A'), mergeResult, new Microservice('C')
    ])
    expect(mergedSystem.getEdges()).to.have.deep.members([
      new AsyncInfoFlow(new Microservice('A'), mergeResult),
      new AsyncInfoFlow(mergeResult, new Microservice('C'))
    ])
  })

  it('can merge when exchange is connected to other nodes', function() {
    const mergedSystem = new ServiceExchangeMerger().mergeServiceAndExchangeOfSameNameToService(
      Node.ofEdgesWithNodes('S', [
        new AsyncInfoFlow(new Microservice('X'), new MessageExchange('B')),
        new AsyncInfoFlow(new Microservice('B'), new MessageExchange('B')),
        new AsyncInfoFlow(new MessageExchange('B'), new Microservice('Y'))
      ])
    )

    expect(mergedSystem.getNodes()).to.have.deep.members([
      new Microservice('X'), new Microservice('B'), new Microservice('Y')
    ])
    expect(mergedSystem.getEdges()).to.have.deep.members([
      new AsyncInfoFlow(new Microservice('X'), new Microservice('B')),
      new AsyncInfoFlow(new Microservice('B'), new Microservice('Y'))
    ])
  })

  it('can merge and keeps unconnected nodes', function() {
    const system = Node.ofEdgesWithNodes('S', [
      new AsyncInfoFlow(new Microservice('B'), new MessageExchange('B'))
    ])
    system.addNodeUniquely(new Microservice('X'))

    const mergedSystem = new ServiceExchangeMerger().mergeServiceAndExchangeOfSameNameToService(system)

    expect(mergedSystem.getNodes()).to.have.deep.members([
      new Microservice('X'), new Microservice('B')
    ])
    expect(mergedSystem.getEdges()).to.be.empty
  })

})
