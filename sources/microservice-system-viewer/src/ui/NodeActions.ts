import * as d3 from 'd3'

import { Node } from '../domain/model'
import { SystemRenderer } from '../SystemRenderer'
import { NodeFocusser } from '../domain/NodeFocusser'
import { GraphService } from '../domain/service'
import { EventRegistrator } from '../viewhelper/EventRegistrator'

export class NodeActions {
  private nodeFocusser: NodeFocusser
  private focusedSystem: Node = null
  private focusedNodeId: string = null
  private focusLevel: number = 1
  private altKeyPressed: boolean = false
  private altKeyInfoText: string = null
  private selectedNode: any = null
  private initialNodeColor: string = null

  constructor(private systemRenderer: SystemRenderer, private graphService: GraphService) {
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

      if (this.altKeyPressed) {
        if (this.focusedNodeId === id) {
          this.focusLevel++
        } else {
          this.focusLevel = 1
        }
        this.focusedNodeId = id
        this.focusedSystem = this.nodeFocusser.focusNodeById(id, this.focusLevel)

        const actualThis = this
        this.systemRenderer.renderSystem(this.focusedSystem, function() {
          // INFO: extracting this code to a separate function was not working
          d3.selectAll('.node,.cluster')
            .select((d, i, nodes) => {
              const selectedNode = d3.select(nodes[i])
              const selectedId = selectedNode.attr('id')
              if (selectedId && selectedId === actualThis.focusedNodeId) {
                actualThis.changeColor(selectedNode, '#ff6300')
              }
            })

          actualThis.install()
        })
      } else {
        const node = this.graphService.findNode(id)
        const url = node.getProp('url', null)
        if (url) {
          window.open(url, '_blank')
        }
      }
    })

    d3.selectAll('.node,.cluster')
    .on('mouseover', (d, i, nodes) => {
      this.selectedNode = d3.select(nodes[i])
      this.initialNodeColor = this.getColor(this.selectedNode)

      if (this.altKeyPressed) {
        this.showAltInfoForCurrentNode()
      } else {
        this.showInfoForCurrentNode()
      }
    })
    .on('mouseout', () => {
      this.showDefaultForCurrentNode()
      this.selectedNode = null
    })
  }

  private registerAltKey() {
    this.saveAltKeyInfo()

    window.onkeydown = (ev: KeyboardEvent) => {
      this.altKeyPressed = ev.altKey
      if (this.altKeyPressed) {
        this.showAltKeyPressed()
        this.showAltInfoForCurrentNode()
      } else {
        this.showAltKeyInfo()
      }
    }

    window.onkeyup = (ev: KeyboardEvent) => {
      this.altKeyPressed = ev.altKey
      if (!this.altKeyPressed) {
        this.showAltKeyInfo()
      }
      if (this.selectedNode) {
        this.showInfoForCurrentNode()
      } else {
        this.showDefaultForCurrentNode()
      }
    }
  }

  private saveAltKeyInfo() {
    const altKeyInfo = d3.select('#alt-key-info')
    this.altKeyInfoText = altKeyInfo.text()
  }

  private showAltKeyPressed() {
    const altKeyInfo = d3.select('#alt-key-info')
    altKeyInfo.classed('blue', false)
    altKeyInfo.classed('white bg-red', true)
    altKeyInfo.text('🎯 Node focus mode activated!')
  }

  private showAltKeyInfo() {
    const altKeyInfo = d3.select('#alt-key-info')
    altKeyInfo.classed('blue', true)
    altKeyInfo.classed('white bg-red', false)
    altKeyInfo.text(this.altKeyInfoText)
  }

  private showAltInfoForCurrentNode() {
    if (this.selectedNode) {
      this.changeColor(this.selectedNode, '#ff4136')
    }
  }

  private showInfoForCurrentNode() {
    if (this.selectedNode) {
      this.changeColor(this.selectedNode, '#96ccff')
    }
  }

  private showDefaultForCurrentNode() {
    if (this.selectedNode) {
      this.changeColor(this.selectedNode, this.initialNodeColor)
    }
  }

  private getColor(node: any): string {
    if (!this.selectedNode.select('polygon').empty()) {
      return this.selectedNode.select('polygon').attr('fill')
    } else if (!this.selectedNode.select('path').empty()) {
      return this.selectedNode.select('path').attr('fill')
    }
    return null
  }

  private changeColor(node: any, color: string) {
    if (!node.select('polygon').empty()) {
      node.select('polygon').attr('fill', color)
    } else if (!node.select('path').empty()) {
      node.select('path').attr('fill', color)
    }
  }
}
