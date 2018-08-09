import { Node, Edge } from './model'
import _ = require('lodash')

export function convertSystemToDot(system: Node): string {
  let dotNodes: string = convertNodesToDot(getNonSubSystemNodes(system), 1)

  let dotSubGraphs: string = getSubSystemNodes(system)
    .map((subSystem) => convertSubSystemToDot(subSystem))
    .join('\n')

  let dotLinks: string = convertEdgesToDot(system.getEdges(), 1)

  // splines=ortho;
  // splines=polyline;
  let dotGraph: string = `strict digraph {
    ranksep=2;
    newrank=true;
    splines=polyline;
    edge[dir=both, arrowhead="normal", arrowtail="dot"];
  ${dotNodes}
${dotSubGraphs}
  ${dotLinks}
}`
  return dotGraph
}

function getSubSystemNodes(node: Node): Node[] {
  return node.getNodes().filter(node => node.hasNodes())
}

function getNonSubSystemNodes(node: Node): Node[] {
  return node.getNodes().filter(node => !node.hasNodes())
}

function addSpaces(n: number): string {
  return _.fill(Array(n), '  ')
    .join('')
}

function convertSubSystemToDot(node: Node): string {
  let dotNodes: string = convertNodesToDot(node.getNodes(), 2)
  let dotEdges: string = convertEdgesToDot(node.getEdges(), 2)
  let dotGraph = `  subgraph cluster_${node.getName()} {
    label = "cabinet ${node.getName()}";
    fontname="Arial";
    style="filled";
    color="#f8ecc9";
    ${dotNodes}
    ${dotEdges}
  }`
  return dotGraph
}

function convertNodesToDot(nodes: Node[], identation: number): string {
  return nodes
    .map((node) => {
      const id = makeId(node.id)
      const styling = getNodeStyling(node)
      return `${id} [${styling},fontname="Arial"]`
    })
    .join(';\n' + addSpaces(identation)) + (nodes.length > 0 ? ';' : '')
}

function getNodeStyling(node: Node): string {
  if (node.type === 'MessageExchange') {
    return `shape=cylinder,style=filled,fillcolor=lightgrey,label="${node.getName()}"`
  } else {
    const urlProp = node.getProp('url', null)
    const optionalUrl = urlProp ? `,URL="${urlProp.value}"` : ''
    return `shape=box,style=filled,fillcolor=gold,label="${node.getName()}"${optionalUrl}`
  }
}

function convertEdgesToDot(edges: Edge[], identation: number): string {
  return edges.map((edge) => {
    const sourceId = makeId(edge.sourceId)
    const targetId = makeId(edge.targetId)
    const styling = getEdgeStyling(edge)
    return `${sourceId} -> ${targetId} ${styling}`
  }).join(';\n' + addSpaces(identation)) + (edges.length > 0 ? ';' : '')
}

function getEdgeStyling(edge: Edge): string {
  if (edge.type === 'SyncInfoFlow') {
    return '[color=red,arrowhead=normal]'
  } else {
    return ''
  }
}

function makeId(value: string) {
  return value.replace(/[ -\.]/g, '_')
}
