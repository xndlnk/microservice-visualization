import { describe, it } from 'mocha'
import { expect } from 'chai'
import { Node, Edge, System, Microservice } from '~/model/model'
import { SubsystemPropertyTransformer } from '~/processor/v1/SubsystemPropertyTransformer'

/* tslint:disable:no-unused-expression */
describe('subsystem property transformer', function() {

  it('can transform subsystem properties to subsystems', function() {
    const systemWithSubSystemProperties: Node = Node.ofEdgesWithNodes('S0', [
      new Edge(
        new Node('A', null, null, null, { subsystem: 'S1' }),
        new Node('B', null, null, null, { subsystem: 'S1' })),
      new Edge(
        new Node('A'),
        new Node('C', null, null, null, { subsystem: 'S2' })),
      new Edge(
        new Node('A'),
        new Microservice('D'))
    ])

    const transformedSystem = new SubsystemPropertyTransformer().transformSubsystemPropertiesToSubsystems(systemWithSubSystemProperties)

    const nodeA = new Node('A', null, null, null, { subsystem: 'S1' })
    const nodeB = new Node('B', null, null, null, { subsystem: 'S1' })
    const nodeC = new Node('C', null, null, null, { subsystem: 'S2' })
    const msD = new Microservice('D')

    const expectedSystem = new System('S0',
      [
        new System('S1', [ nodeA, nodeB ], [ new Edge(nodeA, nodeB) ]),
        new System('S2', [ nodeC ]),
        msD
      ],
      [
        new Edge(nodeA, nodeC),
        new Edge(nodeA, msD)
      ])

    expect(transformedSystem).to.deep.equal(expectedSystem)
  })
})
