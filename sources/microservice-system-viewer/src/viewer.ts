import * as axios from 'axios'
import 'tachyons/css/tachyons.css'
import './html/style.css'
import { select } from 'd3'

import { getBaseUrlInCurrentEnvironment } from './appBaseUrl'

import { GraphService } from './domain/service'
import { Node, INode } from './domain/model'
import { NodeActions } from './ui/NodeActions'
import { MenuActions } from './ui/MenuActions'
import { LoadExampleAction } from './ui/LoadExampleAction'

const queryPart = window.location.href.substr(window.location.href.lastIndexOf('?'))
const systemUrl = getBaseUrlInCurrentEnvironment() + '/system' + queryPart
console.log('fetching system from url ' + systemUrl)

// can also use: axios.defaults.baseURL
axios.default
  .get(systemUrl)
  .then((response) => {
    const rawSystem = response.data
    displaySystem(rawSystem)
  })
  .catch((error) => {
    const errorDiv = select('#graph')
      .append('div')
      .classed('pa2 bg-red white', true)

    errorDiv.append('div')
      .classed('f3 pa2 bg-red white', true)
      .text(error)

    errorDiv.append('div')
      .text('Load example')
      .attr('id', 'load-example-link')
      .classed('f5 grow no-underline br-pill ph3 pv2 dib red bg-white clickable', true)

    new LoadExampleAction().install(displaySystem)
  })

let loadingFinished = false
let loadStatusDiv = null

function checkLoadProgress() {
  console.log('checking load progress')
  if (!loadingFinished) {
    setTimeout(checkLoadProgress, 500)
  }
}

function displaySystem(rawSystem: INode) {
  const system = Node.ofRawNode(rawSystem)
  GraphService.deepResolveNodesReferencedInEdges(system)

  if (!loadingFinished) {
    addLoadSpinner()
    // checkLoadProgress()
    asyncLoadSystemRenderer(system)

    // uncomment for testing
    /*setTimeout(function() {
      asyncLoadSystemRenderer(system)
    }, 2000)*/
  }
}

function addLoadSpinner() {
  loadStatusDiv = select('#content')
    .insert('div')
    .classed('vh-75 w-100 dt', true)

  const divForImg = loadStatusDiv
    .append('div')

  divForImg.classed('dtc tc v-mid bg-white', true)

  divForImg.append('img')
    .attr('src', 'spinner.svg')
    .attr('width', '200')
    .attr('alt', 'loading')
}

function asyncLoadSystemRenderer(system: Node) {
  return import(/* webpackChunkName: "SystemRenderer" */ './SystemRenderer').then(SystemRenderer => {
    removeLoadStatus()

    const systemRenderer = new SystemRenderer.SystemRenderer()
    const graphService = new GraphService(system)

    systemRenderer.renderSystem(system)
    new MenuActions(systemRenderer, graphService).install()
    new NodeActions(systemRenderer, graphService).install()
  })
}

function removeLoadStatus() {
  loadingFinished = true
  loadStatusDiv.remove()
}
