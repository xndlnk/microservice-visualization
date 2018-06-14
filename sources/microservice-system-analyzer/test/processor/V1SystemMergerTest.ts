import { describe, it } from 'mocha'
import { expect } from 'chai'
import * as v1 from '~/model/model'
import * as v0 from '~/model/modelClasses'
import { V1SystemMerger } from '~/processor/V1SystemMerger'

/* tslint:disable:no-unused-expression */
describe('system merger', function() {

  it('can merge two systems of the same name with their properties', function() {
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
      [ msA, msBexpected, exC ],
      [
        new v1.SyncInfoFlow(msA, msB),
        new v1.AsyncInfoFlow(msB, exC)
      ])

    expect(mergedSystem).to.be.not.null
    expect(mergedSystem.getName()).to.eql('S')
    expect(mergedSystem.getNodes()).to.have.deep.members(expectedMergedSystem.getNodes())
    expect(mergedSystem.getEdges()).to.have.deep.members(expectedMergedSystem.getEdges())
  })
})
