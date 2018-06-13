import { describe, it } from 'mocha'
import { expect } from 'chai'
import * as v1Model from '~/model/model'
import * as v0Model from './modelClasses'
import { ModelConverter } from '~/model/ModelConverter'

/* tslint:disable:no-unused-expression */
describe('model converter', function() {

  it('can convert services, exchanges, and the links between them', function() {
    const system: v0Model.System = {
      name: 'S',
      services: [
        { name: 'A' },
        { name: 'B' },
        { name: 'exchange C' },
        { name: 'D' }
      ],
      links: [
        { sourceName: 'A', targetName: 'B', communicationType: 'async' },
        { sourceName: 'B', targetName: 'exchange C', communicationType: 'async' },
        { sourceName: 'exchange C', targetName: 'D', communicationType: 'async' }
      ]
    }

    const v1system = new ModelConverter().convertSystem(system)

    console.log(JSON.stringify(v1system, null, 2))

    const expectedv1system = new v1Model.System('S')

    const msA = new v1Model.Microservice('A')
    const msB = new v1Model.Microservice('B')
    const msD = new v1Model.Microservice('D')
    expectedv1system.getMicroservices().push(msA)
    expectedv1system.getMicroservices().push(msB)
    expectedv1system.getMicroservices().push(msD)

    const exC = new v1Model.MessageExchange('C')
    expectedv1system.getMessageExchanges().push(exC)

    expectedv1system.getInfoFlows().push(new v1Model.AsyncInfoFlow(msA, msB))
    expectedv1system.getInfoFlows().push(new v1Model.AsyncInfoFlow(msB, exC))
    expectedv1system.getInfoFlows().push(new v1Model.AsyncInfoFlow(exC, msD))

    expect(v1system).to.deep.equal(expectedv1system)
  })

  /*it('can convert properties', function() {
    const system: System = {
      name: 'S',
      services: [
        {
          name: 'A',
          properties: [
            { name: 'p1', value: 'v1' }
          ]
        }
      ]
    }

    const node = new ModelConverter().convertSystemToNode(system)

    const expectedNode: Node = RawModelConverter.convertToNode({
      name: 'S',
      kind: 'system',
      nodes: [
        {
          name: 'A',
          kind: 'microservice',
          props: {
            p1: 'v1'
          }
        }
      ]
    })

    expect(node).to.deep.equal(expectedNode)
  })

  it('can convert subsystems', function() {
    const system: System = {
      name: 'S',
      services: [
        { name: 'A' }
      ],
      links: [
        { sourceName: 'A', targetName: 'M', communicationType: 'async' }
      ],
      subSystems: [
        {
          name: 'P',
          services: [
            { name: 'M' },
            { name: 'N' }
          ],
          links: [
            { sourceName: 'M', targetName: 'N', communicationType: 'async' }
          ]
        }
      ]
    }

    const node = new ModelConverter().convertSystemToNode(system)

    const expectedNode: Node = RawModelConverter.convertToNode({
      name: 'S',
      kind: 'system',
      nodes: [
        { name: 'A', kind: 'microservice' },
        {
          name: 'P',
          kind: 'system',
          nodes: [
            { name: 'M', kind: 'microservice' },
            { name: 'N', kind: 'microservice' }
          ],
          edges: [
            { sourceId: 'M', targetId: 'N', props: { communicationType: 'async' } }
          ]
        }
      ],
      edges: [
        { sourceId: 'A', targetId: 'M', props: { communicationType: 'async' } }
      ]
    })

    expect(node).to.deep.equal(expectedNode)
  })

  it('can convert exchanges', function() {
    const system: System = {
      name: 'S',
      services: [
        { name: 'A' },
        { name: 'exchange A' }
      ]
    }

    const node = new ModelConverter().convertSystemToNode(system)

    const expectedNode: Node = RawModelConverter.convertToNode({
      name: 'S',
      kind: 'system',
      nodes: [
        { name: 'A', kind: 'microservice' },
        { name: 'A', kind: 'exchange' }
      ]
    })

    expect(node).to.deep.equal(expectedNode)
  })

  it('can convert link between service and exchange', function() {
    const system: System = {
      name: 'S',
      services: [
        { name: 'A' },
        { name: 'exchange A' }
      ],
      links: [
        { sourceName: 'A', targetName: 'exchange A', communicationType: 'async' }
      ]
    }

    const node = new ModelConverter().convertSystemToNode(system)

    const expectedNode: Node = RawModelConverter.convertToNode({
      name: 'S',
      kind: 'system',
      nodes: [
        { name: 'A', kind: 'microservice' },
        { name: 'A', kind: 'exchange' }
      ],
      edges: [
        { sourceId: 'A', targetId: 'M', props: { communicationType: 'async' } }
      ]
    })

    expect(node).to.deep.equal(expectedNode)
  })*/
})
