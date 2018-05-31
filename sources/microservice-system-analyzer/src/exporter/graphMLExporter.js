const xmlBuilder = require('xmlbuilder')

function getGraphML (system) {
  let graphml = xmlBuilder.create('graphml')
  graphml.att('xmlns', 'http://graphml.graphdrawing.org/xmlns')

  graphml.ele('key', { 'id': 'nodeLabel', 'for': 'node', 'attr.name': 'label', 'attr.type': 'string' })
  graphml.ele('key', { 'id': 'edgeType', 'for': 'edge', 'attr.name': 'type', 'attr.type': 'string' })

  // TODO: add definition for any properties found
  // TODO: test this
  graphml.ele('key', { 'id': 'nodeCabinet', 'for': 'node', 'attr.name': 'cabinet', 'attr.type': 'string' })
  graphml.ele('key', { 'id': 'nodeCabinetColor', 'for': 'node', 'attr.name': 'cabinetColor', 'attr.type': 'string' })

  let graph = graphml.ele('graph')
  graph.att('edgedefault', 'directed')

  addServices(graph, system)
  addLinks(graph, system)
  addSubSystems(graph, system)

  return graphml.end({pretty: true})
}

function addSubSystems (parentGraph, system) {
  system.subSystems.forEach((subSystem) => {
    let node = parentGraph.ele('node')
    node.att('id', 'subsystem::' + subSystem.name)
    node.ele('data', { 'key': 'nodeLabel' }, subSystem.name)

    let subGraph = node.ele('graph')
    subGraph.att('edgedefault', 'directed')

    addServices(subGraph, subSystem)
    addLinks(subGraph, subSystem)
  })
}

function addServices (graph, system) {
  system.services.forEach((service) => {
    let node = graph.ele('node')
    node.att('id', service.name)
    node.ele('data', { 'key': 'nodeLabel' }, service.name)
    // TODO: add values for any properties found
    if (service.hasProperty('cabinet')) {
      node.ele('data', { 'key': 'nodeCabinet' }, service.getPropertyValue('cabinet'))
      node.ele('data', { 'key': 'nodeCabinetColor' }, service.getPropertyValue('cabinetColor'))
    }
  })
}

function addLinks (graph, system) {
  system.links.forEach((link) => {
    let edge = graph.ele('edge')
    let edgeId = link.sourceName + '-' + link.targetName + ':' + link.communicationType
    edge.att('id', edgeId)
    edge.att('source', link.sourceName)
    edge.att('target', link.targetName)
    edge.ele('data', { 'key': 'edgeType' }, link.communicationType)
  })
}

module.exports = {
  getGraphML
}
