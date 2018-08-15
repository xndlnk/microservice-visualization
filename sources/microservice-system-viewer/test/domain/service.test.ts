import { describe, it, test } from 'mocha'
import { expect } from 'chai'
import { Node } from '../../src/server/domain/model'
import { GraphService } from '../../src/server/domain/service'

describe('graph service functions', function() {

  test('find nodes by id', () => {
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
      ]
    })
    let graphService = new GraphService(graph)

    expect(graphService.findNode('a').id).to.eql('a')
    expect(graphService.findNode('c').id).to.eql('c')
  })

  test('reduce node to certain nodes', () => {
    let node: Node = Node.ofRawNode({
      id: 'a',
      nodes: [
        { id: 'b' },
        {
          id: 'c',
          nodes: [
            { id: 'd' },
            { id: 'e' }
          ],
          edges: [
            { sourceId: 'd', targetId: 'e' }
          ]
        }
      ],
      edges: [
        { sourceId: 'b', targetId: 'c' },
        { sourceId: 'b', targetId: 'd' }
      ]
    })
    let graphService = new GraphService(node)

    expect(graphService.reduceNodesRecursive(node, ['b', 'c']))
      .to.eql(Node.ofRawNode({
        id: 'a',
        nodes: [
          { id: 'b' },
          { id: 'c' }
        ],
        edges: [
          { sourceId: 'b', targetId: 'c' }
        ]
      }))

    expect(graphService.reduceNodesRecursive(node, ['d', 'e']))
      .to.eql(Node.ofRawNode({
        id: 'a',
        nodes: [
          {
            id: 'c',
            nodes: [
              { id: 'd' },
              { id: 'e' }
            ],
            edges: [
              { sourceId: 'd', targetId: 'e' }
            ]
          }
        ]
      }))
  })

})
