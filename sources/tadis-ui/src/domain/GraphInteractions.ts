import { Node, Edge } from './model'
import { NodeFocusser } from './NodeFocusser'
import { NodeCollapser } from './NodeCollapser'
import { GraphService } from './service'
import * as _ from 'lodash'

export class GraphInteractions {
  static focusNode(graph: Node, focusNodeId: string): Node {
    return new NodeFocusser(new GraphService(graph)).focusNodeById(focusNodeId)
  }

  static collapseNode(graph: Node): Node {
    return new NodeCollapser().collapseContainedNodes(graph)
  }
}
