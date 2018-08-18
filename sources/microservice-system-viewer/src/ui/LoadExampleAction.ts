import * as d3 from 'd3'

import { SystemRenderer } from '../SystemRenderer'
import { GraphService } from '../domain/service'
import { Node } from '../domain/model'
import { system as rawSystem } from '../exampleSystems/simpleSystem'

export class LoadExampleAction {
  install() {
    this.registerHandlers()
  }

  registerHandlers() {
    const systemRenderer = new SystemRenderer()
    const system = Node.ofRawNode(rawSystem)
    GraphService.deepResolveNodesReferencedInEdges(system)

    d3.select('#load-example-link').on('click', () => {
      d3.select('#graph').text('')
      systemRenderer.renderSystem(system)
    })
  }
}
