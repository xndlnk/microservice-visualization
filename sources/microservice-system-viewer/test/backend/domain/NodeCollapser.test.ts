import { describe, it, test } from 'mocha'
import { expect } from 'chai'
import { Node } from '~/backend/domain/model'
import { GraphService } from '../../../src/backend/domain/service'
import { NodeCollapser } from '../../../src/backend/domain/NodeCollapser'

describe('node collapser', function() {

  test('top level parent node of a graph is found', () => {
    let graph: Node = Node.ofRawNode({
      id: 'test-graph',
      nodes: [
        {
          id: 'a'
        },
        {
          id: 'b',
          nodes: [
            {
              id: 'c',
              nodes: [
                {
                  id: 'd'
                }
              ]
            }
          ]
        }
      ]
    })

    let nodeCollapser = new NodeCollapser()

    expect(nodeCollapser.getTopLevelParentInGraph(graph, 'c').id).to.eql('b')
    expect(nodeCollapser.getTopLevelParentInGraph(graph, 'd').id).to.eql('b')
  })

  test('edges to inside nodes of all contained nodes are moved to edges to the contained nodes themselfes', () => {
    let graph: Node = Node.ofRawNode({
      id: 'test-graph',
      nodes: [
        { id: 'a' },
        {
          id: 'b',
          nodes: [
            { id: 'c' }
          ]
        }
      ],
      edges: [
        { sourceId: 'a', targetId: 'c' }
      ]
    })

    let nodeCollapser = new NodeCollapser()
    let collapsedGraph = nodeCollapser.collapseContainedNodes(graph)

    let expectedGraph: Node = Node.ofRawNode({
      id: 'test-graph',
      nodes: [
        { id: 'a' },
        { id: 'b' }
      ],
      edges: [
        { sourceId: 'a', targetId: 'b' }
      ]
    })

    expect(collapsedGraph).to.eql(expectedGraph)
  })

})
