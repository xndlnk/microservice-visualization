import * as axios from 'axios'
import { select } from 'd3'

import { getBaseUrlInCurrentEnvironment } from './appBaseUrl'

import { SystemRenderer } from './SystemRenderer'
import { GraphService } from './domain/service'
import { Node, INode } from './domain/model'
import { NodeActions } from './ui/NodeActions'
import { MenuActions } from './ui/MenuActions'
import { LoadExampleAction } from './ui/LoadExampleAction'

export function load() {
  displayVersion()

  const queryPart = window.location.href.substr(window.location.href.lastIndexOf('?'))
  const systemUrl = getBaseUrlInCurrentEnvironment() + '/system' + queryPart
  console.log('fetching system from url ' + systemUrl)

  // can also use: axios.defaults.baseURL
  axios.default
    .get(systemUrl)
    .then((response) => {
      const rawSystem = response.data
      const system = Node.ofRawNode(rawSystem)
      displaySystemTitle(system)
      displayNodesRemoved(system)
      displaySystem(system)
    })
    .catch((error) => {
      replaceSpinnerByGraphBox()

      const errorDiv = select('#graphBox')
        .append('div')
        .classed('pa2 bg-red white', true)

      errorDiv.append('div')
        .classed('f3 pa2 bg-red white', true)
        .text(error)

      errorDiv.append('div')
        .text('Show demo system')
        .attr('id', 'load-example-link')
        .classed('f5 grow no-underline br-pill ph3 pv2 dib red bg-white clickable', true)

      new LoadExampleAction().install(displaySystem)
    })
}

function displayVersion() {
  axios.default
    .get(getBaseUrlInCurrentEnvironment() + '/version')
    .then((response) => {
      const version = response.data
      select('#title')
        .select('a')
        .attr('href', 'https://github.com/MaibornWolff/microservice-visualization/releases/tag/v' + version)
        .text('Viewer v' + version)
    })
}

function displaySystemTitle(system: Node) {
  if (system.getName() && system.getName() !== '') {
    select('#system-title')
      .text('System Architecture of ' + system.getName())
  }
}

function displayNodesRemoved(system: Node) {
  const metadata = system.getProp('metadata', null)
  if (metadata && metadata.transformer === 'StaticNodeFilter') {
    select('#node-filter-info')
      .text(metadata.info)
  } else {
    select('#node-filter-info')
      .text('none')
  }
}

function displaySystem(system: Node) {
  GraphService.deepResolveNodesReferencedInEdges(system)

  setTimeout(function() {
    asyncLoadSystemRenderer(system)
  }, 10)
}

function asyncLoadSystemRenderer(system: Node) {
  const systemRenderer = new SystemRenderer()
  const graphService = new GraphService(system)

  systemRenderer.renderSystem(system, () => {
    replaceSpinnerByGraphBox()
  })
  new MenuActions(systemRenderer, graphService).install()
  new NodeActions(systemRenderer, graphService).install()
}

function replaceSpinnerByGraphBox() {
  select('#loadSpinner').remove()
  select('#graphBox').style('display', 'block')
}
