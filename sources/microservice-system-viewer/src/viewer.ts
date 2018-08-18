import * as axios from 'axios'
import { getBaseUrlInCurrentEnvironment } from './appBaseUrl'
import { EventRegistrator } from './viewhelper/EventRegistrator'
import 'tachyons/css/tachyons.css'
import './html/style.css'
import * as d3Base from 'd3'
import { graphviz } from 'd3-graphviz'

import { SystemToDotConverter, Options as ConverterOptions } from './domain/systemToDot'
import { GraphService } from './domain/service'
import { Node, INode } from './domain/model'
import { NodeFocusser } from './domain/NodeFocusser'

// attach all d3 plugins to the d3 library
// see https://www.giacomodebidda.com/how-to-import-d3-plugins-with-webpack/
const d3 = Object.assign(d3Base, { graphviz })

const queryPart = window.location.href.substr(window.location.href.lastIndexOf('?'))
const systemUrl = getBaseUrlInCurrentEnvironment() + '/system' + queryPart
console.log('fetching system from url ' + systemUrl)

let altKeyPressed: boolean = false
let selectedNodePolygon: any = null

// can also use: axios.defaults.baseURL
axios.default
  .get(systemUrl)
  .then(function(response) {
    const rawSystem = response.data
    const system = Node.ofRawNode(rawSystem)
    GraphService.deepResolveNodesReferencedInEdges(system)
    const nodeFocusser = new NodeFocusser(new GraphService(system))
    renderSystem(system, nodeFocusser)

    registerMenuHandlers()
    registerAltKey()
    EventRegistrator.init()
  })
  .catch(function(error) {
    let element: HTMLElement = document.createElement('div')
    element.innerHTML = error
    document.body.appendChild(element)
  })

function renderSystem(system: Node, nodeFocusser: NodeFocusser) {
  const systemToDotConverter = new SystemToDotConverter()

  const transition = d3.transition()
      .delay(100)
      .duration(1000)

  d3.select('#graph')
    .graphviz()
    .transition(transition)
    .renderDot(systemToDotConverter.convertSystemToDot(system))

  d3.selectAll('.node')
    .on('click', function() {
      const id = d3.select(this).attr('id')
      const focusedSystem = nodeFocusser.focusNodeById(id)
      renderSystem(focusedSystem, nodeFocusser)
    })

  d3.selectAll('.node')
    .on('mouseover', function() {
      selectedNodePolygon = d3.select(this).select('polygon')
      if (altKeyPressed) {
        altHighlightCurrentlySelectedNodePolygon()
      } else {
        infoHighlightCurrentlySelectedNodePolygon()
      }
    })
    .on('mouseout', function() {
      removeHighlightOnCurrentlySelectedNodePolygon()
      selectedNodePolygon = null
    })
}

function registerMenuHandlers() {
  d3.select('#info-link').on('click', function() {
    const infoElement = d3.select('#info')
    const currentDisplay = infoElement.style('display')
    infoElement.style('display', currentDisplay === 'none' ? 'block' : 'none')
  })
}

function registerAltKey() {
  window.onkeydown = (ev: KeyboardEvent) => {
    altKeyPressed = ev.altKey
    altHighlightCurrentlySelectedNodePolygon()
  }

  window.onkeyup = (ev: KeyboardEvent) => {
    altKeyPressed = ev.altKey
    if (selectedNodePolygon) {
      infoHighlightCurrentlySelectedNodePolygon()
    } else {
      removeHighlightOnCurrentlySelectedNodePolygon()
    }
  }
}

function altHighlightCurrentlySelectedNodePolygon() {
  if (selectedNodePolygon) {
    selectedNodePolygon.attr('fill', '#ff4136')
  }
}

function infoHighlightCurrentlySelectedNodePolygon() {
  if (selectedNodePolygon) {
    selectedNodePolygon.attr('fill', '#96ccff')
  }
}

function removeHighlightOnCurrentlySelectedNodePolygon() {
  if (selectedNodePolygon) {
    selectedNodePolygon.attr('fill', '#ffde37')
  }
}
