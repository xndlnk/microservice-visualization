import * as d3 from 'd3'

import { SystemRenderer } from '../SystemRenderer'
import { NodeFocusser } from '../domain/NodeFocusser'
import { GraphService } from '../domain/service'

export class MenuActions {
  private nodeFocusser

  constructor(private systemRenderer: SystemRenderer, private graphService: GraphService) {
    this.nodeFocusser = new NodeFocusser(graphService)
  }

  install() {
    this.registerMenuHandlers()
  }

  registerMenuHandlers() {
    d3.select('#info-link').on('click', () => {
      const infoElement = d3.select('#info')
      const currentDisplay = infoElement.style('display')
      infoElement.style('display', currentDisplay === 'none' ? 'block' : 'none')
    })

    d3.select('#complete-link').on('click', () => {
      this.systemRenderer.renderSystem(this.graphService.getGraph())
    })
  }
}
