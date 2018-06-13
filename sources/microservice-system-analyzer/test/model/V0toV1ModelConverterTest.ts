import { describe, it } from 'mocha'
import { expect } from 'chai'
import * as v1 from '~/model/model'
import * as v0 from './modelClasses'
import { V0toV1ModelConverter } from '~/model/V0toV1ModelConverter'

/* tslint:disable:no-unused-expression */
describe('model converter', function() {

  it('can convert services, exchanges, and the links between them', function() {
    const system: v0.System = {
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

    const v1system = new V0toV1ModelConverter().convertSystem(system)

    const expectedv1system = new v1.System('S')

    const msA = new v1.Microservice('A')
    const msB = new v1.Microservice('B')
    const msD = new v1.Microservice('D')
    expectedv1system.getMicroservices().push(msA)
    expectedv1system.getMicroservices().push(msB)
    expectedv1system.getMicroservices().push(msD)

    const exC = new v1.MessageExchange('C')
    expectedv1system.getMessageExchanges().push(exC)

    expectedv1system.getInfoFlows().push(new v1.AsyncInfoFlow(msA, msB))
    expectedv1system.getInfoFlows().push(new v1.AsyncInfoFlow(msB, exC))
    expectedv1system.getInfoFlows().push(new v1.AsyncInfoFlow(exC, msD))

    expect(v1system).to.deep.equal(expectedv1system)
  })

  it('can convert properties', function() {
    const system: v0.System = {
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

    const v1system = new V0toV1ModelConverter().convertSystem(system)

    const expectedv1system = new v1.System('S')
    const msA = new v1.Microservice('A')
    msA.getProperties().p1 = 'v1'
    expectedv1system.getMicroservices().push(msA)

    expect(v1system).to.deep.equal(expectedv1system)
  })

  it('can convert subsystems', function() {
    const system: v0.System = {
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

    const v1system = new V0toV1ModelConverter().convertSystem(system)

    const expectedv1system = new v1.System('S')
    const msA = new v1.Microservice('A')
    expectedv1system.getMicroservices().push(msA)

    const sP = new v1.System('P')
    expectedv1system.getSubSystems().push(sP)

    const msM = new v1.Microservice('M')
    const msN = new v1.Microservice('N')
    sP.getMicroservices().push(msM)
    sP.getMicroservices().push(msN)
    sP.getInfoFlows().push(new v1.AsyncInfoFlow(msM, msN))

    expectedv1system.getInfoFlows().push(new v1.AsyncInfoFlow(msA, msM))

    expect(v1system).to.deep.equal(expectedv1system)
  })
})
