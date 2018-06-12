import { describe, it } from 'mocha'
import { expect } from 'chai'
import { Node, Edge } from '~/model/nodeModel'
import { RawNode, RawEdge, RawModelConverter } from '~/model/rawNodeModel'
import { System, Service, Link, Property } from './modelClasses'
import { ModelConverter } from '~/model/ModelConverter'

/* tslint:disable:no-unused-expression */
describe('model converter', function() {

  it('can convert services and links', function() {
    const system: System = {
      name: 'S',
      services: [
        { name: 'A' },
        { name: 'B' }
      ],
      links: [
        { sourceName: 'A', targetName: 'B', communicationType: 'async' }
      ]
    }

    const node = new ModelConverter().convertSystemToNode(system)

    const expectedNode: Node = RawModelConverter.convertToNode({
      name: 'S',
      kind: 'system',
      nodes: [
        { name: 'A', kind: 'microservice' },
        { name: 'B', kind: 'microservice' }
      ],
      edges: [
        { sourceId: 'microservice_A', targetId: 'microservice_B', props: { communicationType: 'async' } }
      ]
    })

    expect(node).to.deep.equal(expectedNode)
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
