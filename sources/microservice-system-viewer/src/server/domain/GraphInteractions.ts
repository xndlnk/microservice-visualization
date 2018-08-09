import { Node, Edge } from './model'
import { NodeFocusser } from './NodeFocusser'
import { GraphService } from './service'
import * as _ from 'lodash'

export class GraphInteractions {
  static focusNode(graph: Node, focusNodeId: string): Node {
    return new NodeFocusser(new GraphService(graph)).focusNodeById(focusNodeId)
  }
}
