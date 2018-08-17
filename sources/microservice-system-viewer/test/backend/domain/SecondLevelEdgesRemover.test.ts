import { describe, it, test } from 'mocha'
import { expect } from 'chai'
import { Node } from '~/backend/domain/model'
import { SecondLevelEdgesRemover } from '../../../src/backend/domain/SecondLevelEdgesRemover'

describe('SecondLevelEdgesRemover', function() {

  test('second level edges are removed', () => {
    let inputGraph: Node = Node.ofRawNode({
      id: 'test-graph',
      nodes: [
        {
          id: 'top1',
          nodes: [
            { id: 'a' }
          ]
        },
        {
          id: 'top2',
          nodes: [
            { id: 'b' },
            { id: 'c' }
          ],
          edges: [
            { sourceId: 'b', targetId: 'c' }
          ]
        }
      ],
      edges: [
        { sourceId: 'a', targetId: 'b' }
      ]
    })

    let expectedGraph: Node = Node.ofRawNode({
      id: 'test-graph',
      nodes: [
        {
          id: 'top1',
          nodes: [
            { id: 'a' }
          ]
        },
        {
          id: 'top2',
          nodes: [
            { id: 'b' },
            { id: 'c' }
          ]
        }
      ],
      edges: [
        { sourceId: 'a', targetId: 'b' }
      ]
    })

    const edgesRemover = new SecondLevelEdgesRemover()
    const resultGraph = edgesRemover.transformer(inputGraph)

    expect(resultGraph).to.eql(expectedGraph)
  })

})
