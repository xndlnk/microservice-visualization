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

  constructor(private systemRenderer: SystemRenderer, graphService: GraphService) {
    this.nodeFocusser = new NodeFocusser(graphService)
  }

  install() {
    this.registerElementHandlers()
    this.registerAltKey()
    EventRegistrator.init()
  }

  private registerElementHandlers() {
    d3.selectAll('.node')
    .on('click', (d, i, nodes) => {
      const id = d3.select(nodes[i]).attr('id')
      const focusedSystem = this.nodeFocusser.focusNodeById(id)
      this.systemRenderer.renderSystem(focusedSystem)
      this.install()
    })

    d3.selectAll('.node')
    .on('mouseover', (d, i, nodes) => {
      this.selectedNodePolygon = d3.select(nodes[i]).select('polygon')
      if (this.altKeyPressed) {
        this.altHighlightCurrentlySelectedNodePolygon()
      } else {
        this.infoHighlightCurrentlySelectedNodePolygon()
      }
    })
    .on('mouseout', () => {
      this.removeHighlightOnCurrentlySelectedNodePolygon()
      this.selectedNodePolygon = null
    })
  }

  private registerAltKey() {
    window.onkeydown = (ev: KeyboardEvent) => {
      this.altKeyPressed = ev.altKey
      this.showAltKeyPressed()
      this.altHighlightCurrentlySelectedNodePolygon()
    }

    window.onkeyup = (ev: KeyboardEvent) => {
      this.altKeyPressed = ev.altKey
      if (!this.altKeyPressed) {
        this.showAltKeyInfo()
      }
      if (this.selectedNodePolygon) {
        this.infoHighlightCurrentlySelectedNodePolygon()
      } else {
        this.removeHighlightOnCurrentlySelectedNodePolygon()
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

  private altHighlightCurrentlySelectedNodePolygon() {
    if (this.selectedNodePolygon) {
      this.selectedNodePolygon.attr('fill', '#ff4136')
    }
  }

  private infoHighlightCurrentlySelectedNodePolygon() {
    if (this.selectedNodePolygon) {
      this.selectedNodePolygon.attr('fill', '#96ccff')
    }
  }

  private removeHighlightOnCurrentlySelectedNodePolygon() {
    if (this.selectedNodePolygon) {
      this.selectedNodePolygon.attr('fill', '#ffde37')
    }
  }
}
