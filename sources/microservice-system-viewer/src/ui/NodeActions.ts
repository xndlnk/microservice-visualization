import * as d3 from 'd3'

import { SystemRenderer } from '../SystemRenderer'
import { NodeFocusser } from '../domain/NodeFocusser'
import { GraphService } from '../domain/service'
import { EventRegistrator } from '../viewhelper/EventRegistrator'

export class NodeActions {
  private nodeFocusser
  private altKeyPressed: boolean = false
  private altKeyInfoText: string = null
  private selectedNodePolygon: any = null
  private initialNodeColor: string = null

  constructor(private systemRenderer: SystemRenderer, graphService: GraphService) {
    this.nodeFocusser = new NodeFocusser(graphService)
  }

  install() {
    this.registerElementHandlers()
    this.registerAltKey()
    EventRegistrator.init()
  }

  // TODO: this should be tested!
  private registerElementHandlers() {
    d3.selectAll('.node,.cluster')
    .on('click', (d, i, nodes) => {
      const id = d3.select(nodes[i]).attr('id')
      const focusedSystem = this.nodeFocusser.focusNodeById(id)
      this.systemRenderer.renderSystem(focusedSystem)
      this.install()
    })

    d3.selectAll('.node,.cluster')
    .on('mouseover', (d, i, nodes) => {
      this.selectedNodePolygon = d3.select(nodes[i]).select('polygon')
      this.initialNodeColor = this.selectedNodePolygon.attr('fill')
      if (this.altKeyPressed) {
        this.showAltInfoForCurrentNode()
      } else {
        this.showInfoForCurrentNode()
      }
    })
    .on('mouseout', () => {
      this.showDefaultForCurrentNode()
      this.selectedNodePolygon = null
    })
  }

  private registerAltKey() {
    window.onkeydown = (ev: KeyboardEvent) => {
      this.altKeyPressed = ev.altKey
      this.showAltKeyPressed()
      this.showAltInfoForCurrentNode()
    }

    window.onkeyup = (ev: KeyboardEvent) => {
      this.altKeyPressed = ev.altKey
      if (!this.altKeyPressed) {
        this.showAltKeyInfo()
      }
      if (this.selectedNodePolygon) {
        this.showInfoForCurrentNode()
      } else {
        this.showDefaultForCurrentNode()
      }
    }
  }

  private showAltKeyPressed() {
    const altKeyInfo = d3.select('#alt-key-info')
    altKeyInfo.classed('blue', false)
    altKeyInfo.classed('white bg-red', true)
    this.altKeyInfoText = altKeyInfo.text()
    altKeyInfo.text('🎯 Node focus mode activated!')
  }

  private showAltKeyInfo() {
    const altKeyInfo = d3.select('#alt-key-info')
    altKeyInfo.classed('blue', true)
    altKeyInfo.classed('white bg-red', false)
    altKeyInfo.text(this.altKeyInfoText)
  }

  private showAltInfoForCurrentNode() {
    if (this.selectedNodePolygon) {
      this.selectedNodePolygon.attr('fill', '#ff4136')
    }
  }

  private showInfoForCurrentNode() {
    if (this.selectedNodePolygon) {
      this.selectedNodePolygon.attr('fill', '#96ccff')
    }
  }

  private showDefaultForCurrentNode() {
    if (this.selectedNodePolygon) {
      this.selectedNodePolygon.attr('fill', this.initialNodeColor)
    }
  }
}
