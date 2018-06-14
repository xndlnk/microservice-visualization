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

    const msA = new v1.Microservice('A')
    const msB = new v1.Microservice('B')
    const msD = new v1.Microservice('D')
    const exC = new v1.MessageExchange('C')

    const expectedv1system = new v1.System('S',
      [ msA, msB, msD, exC ],
      [
        new v1.AsyncInfoFlow(msA, msB),
        new v1.AsyncInfoFlow(msB, exC),
        new v1.AsyncInfoFlow(exC, msD)
      ])

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

    const msA = new v1.Microservice('A')
    msA.addProperty('p1', 'v1')
    const expectedv1system = new v1.System('S', [ msA ])

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

    const msM = new v1.Microservice('M')
    const msN = new v1.Microservice('N')
    const sP = new v1.System('P',
      [ msM, msN ],
      [ new v1.AsyncInfoFlow(msM, msN) ])

    const msA = new v1.Microservice('A')
    const expectedv1system = new v1.System('S',
      [ msA, sP ],
      [ new v1.AsyncInfoFlow(msA, msM) ])

    expect(v1system).to.deep.equal(expectedv1system)
  })
})
