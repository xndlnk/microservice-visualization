import { describe, it } from 'mocha'
import { expect } from 'chai'
import * as v1 from '~/model/model'
import * as v0 from '~/model/modelClasses'
import { V1SystemMerger } from '~/processor/V1SystemMerger'

/* tslint:disable:no-unused-expression */
describe('system merger', function() {

  it('can merge two systems with their properties', function() {
    const v0system: v0.System = {
      name: 'S',
      services: [
        { name: 'A' },
        {
          name: 'B',
          properties: [
            { name: 'p1', value: 'v1' }
          ]
        }
      ],
      links: [
        { sourceName: 'A', targetName: 'B', communicationType: 'sync' }
      ]
    }

    const msB = new v1.Microservice('B')
    const exC = new v1.MessageExchange('C')

    const v1system = new v1.System('S',
      [ msB, exC ],
      [
        new v1.AsyncInfoFlow(msB, exC)
      ])

    const mergedSystem = new V1SystemMerger().mergeWithoutSubSystems([ v0system ], [ v1system ])

    const msA = new v1.Microservice('A')
    const msBexpected = new v1.Microservice('B')
    msBexpected.addProperty('p1', 'v1')

    const expectedMergedSystem = new v1.System('S',
      [ msBexpected, exC, msA ],
      [
        new v1.AsyncInfoFlow(msB, exC),
        new v1.SyncInfoFlow(msA, msB)
      ])

    expect(mergedSystem).to.be.not.null
    expect(mergedSystem.getName()).to.eql('S')
    expect(mergedSystem.getNodes()).to.have.deep.members(expectedMergedSystem.getNodes())
    expect(mergedSystem.getEdges()).to.have.deep.members(expectedMergedSystem.getEdges())
  })

  it('can merge two systems of different names', function() {
    const v0system: v0.System = {
      name: 'S1',
      services: [
        { name: 'A' }
      ]
    }

    const v1system = new v1.System('S2', [ new v1.Microservice('B') ])

    const mergedSystem = new V1SystemMerger().mergeWithoutSubSystems([ v0system ], [ v1system ])

    const expectedMergedSystem = new v1.System('S',
      [ new v1.Microservice('A'), new v1.Microservice('B') ])

    expect(mergedSystem).to.be.not.null
    expect(mergedSystem.getName()).to.eql('S1-S2')
    expect(mergedSystem.getNodes()).to.have.deep.members(expectedMergedSystem.getNodes())
  })
})
