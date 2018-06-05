const xmlBuilder = require('xmlbuilder')

/** returns the provided system as a string in GraphML format */
function getGraphML (system) {
  const graphml = xmlBuilder.create('graphml')
  graphml.att('xmlns', 'http://graphml.graphdrawing.org/xmlns')

  graphml.ele('key', { 'id': 'nodeLabel', 'for': 'node', 'attr.name': 'label', 'attr.type': 'string' })
  graphml.ele('key', { 'id': 'edgeType', 'for': 'edge', 'attr.name': 'type', 'attr.type': 'string' })

  // TODO: add definition for any properties found
  // TODO: test this
  graphml.ele('key', { 'id': 'nodeCabinet', 'for': 'node', 'attr.name': 'cabinet', 'attr.type': 'string' })
  graphml.ele('key', { 'id': 'nodeCabinetColor', 'for': 'node', 'attr.name': 'cabinetColor', 'attr.type': 'string' })

  const graph = graphml.ele('graph')
  graph.att('edgedefault', 'directed')

  addServices(graph, system)
  addLinks(graph, system)
  addSubSystems(graph, system)

  return graphml.end({pretty: true})
}

function addSubSystems (parentGraph, system) {
  system.subSystems.forEach((subSystem) => {
    const node = parentGraph.ele('node')
    node.att('id', 'subsystem::' + subSystem.name)
    node.ele('data', { 'key': 'nodeLabel' }, subSystem.name)

    const subGraph = node.ele('graph')
    subGraph.att('edgedefault', 'directed')

    addServices(subGraph, subSystem)
    addLinks(subGraph, subSystem)
  })
}

function addServices (graph, system) {
  system.services.forEach((service) => {
    const node = graph.ele('node')
    node.att('id', service.name)
    node.ele('data', { 'key': 'nodeLabel' }, service.name)
    // TODO: the exporter has to be independent of specific properties added during
    // system transformation. better add values for any properties found.
    if (service.hasProperty('cabinet')) {
      node.ele('data', { 'key': 'nodeCabinet' }, service.getPropertyValue('cabinet'))
      node.ele('data', { 'key': 'nodeCabinetColor' }, service.getPropertyValue('cabinetColor'))
    }
  })
}

function addLinks (graph, system) {
  system.links.forEach((link) => {
    const edge = graph.ele('edge')
    const edgeId = link.sourceName + '-' + link.targetName + ':' + link.communicationType
    edge.att('id', edgeId)
    edge.att('source', link.sourceName)
    edge.att('target', link.targetName)
    edge.ele('data', { 'key': 'edgeType' }, link.communicationType)
  })
}

module.exports = {
  getGraphML
}
