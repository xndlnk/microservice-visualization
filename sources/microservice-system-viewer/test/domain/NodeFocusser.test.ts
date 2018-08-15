import { describe, it, test } from 'mocha'
import { expect } from 'chai'
import { Node } from '../../src/server/domain/model'
import { GraphService } from '../../src/server/domain/service'
import { NodeFocusser } from '../../src/server/domain/NodeFocusser'

describe('node focusser', function() {

  test('node is focused', () => {
    const graph: Node = Node.ofRawNode({
      id: 'test-graph',
      nodes: [
        { id: 'a' },
        {
          id: 'b',
          nodes: [
            { id: 'c' },
            { id: 'd' }
          ],
          edges: [
            { sourceId: 'c', targetId: 'd' }
          ],
          properties: {
            bProp: 'b-prop-value'
          }
        },
        { id: 'e' }
      ],
      edges: [
        { sourceId: 'a', targetId: 'b' },
        { sourceId: 'a', targetId: 'e' }
      ]
    })

    const nodeFocusser = new NodeFocusser(new GraphService(graph))

    const expectedGraph: Node = Node.ofRawNode({
      id: 'test-graph',
      nodes: [
        { id: 'a' },
        {
          id: 'b',
          nodes: [
            { id: 'c' },
            { id: 'd' }
          ],
          edges: [
            { sourceId: 'c', targetId: 'd' }
          ],
          properties: {
            bProp: 'b-prop-value'
          }
        }
      ],
      edges: [
        { sourceId: 'a', targetId: 'b' }
      ]
    })

    expect(nodeFocusser.focusNodeById('b')).to.eql(expectedGraph)
  })

  test('when a node with no edges is focused then outside nodes with edges to inside nodes are added', () => {
    const graph: Node = Node.ofRawNode({
      id: 'test-graph',
      nodes: [
        { id: 'a' },
        {
          id: 'b',
          nodes: [
            { id: 'c' },
            { id: 'd' }
          ],
          edges: [
            { sourceId: 'c', targetId: 'd' }
          ]
        },
        { id: 'e' }
      ],
      edges: [
        { sourceId: 'a', targetId: 'c' },
        { sourceId: 'a', targetId: 'e' }
      ]
    })

    const nodeFocusser = new NodeFocusser(new GraphService(graph))

    const expectedGraph: Node = Node.ofRawNode({
      id: 'test-graph',
      nodes: [
        { id: 'a' },
        {
          id: 'b',
          nodes: [
            { id: 'c' },
            { id: 'd' }
          ],
          edges: [
            { sourceId: 'c', targetId: 'd' }
          ]
        }
      ],
      edges: [
        { sourceId: 'a', targetId: 'c' }
      ]
    })

    expect(nodeFocusser.focusNodeById('b')).to.eql(expectedGraph)
  })

})
