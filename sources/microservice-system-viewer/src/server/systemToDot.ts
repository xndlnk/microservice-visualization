import { System, Service, Link } from './model'
import _ = require('lodash')

export function convertSystemToDot(system: System): string {
  let dotServices: string = convertServicesToDot(system.services, 1)

  let dotSubGraphs: string = system.subSystems
    .map((subSystem) => convertSubSystemToDot(subSystem))
    .join('\n')

  let dotLinks: string = convertLinksToDot(system.links, 1)

  // splines=ortho;
  // splines=polyline;
  let dotGraph: string = `strict digraph {
    ranksep=2;
    newrank=true;
    splines=polyline;
    edge[dir=both, arrowhead="normal", arrowtail="dot"];
  ${dotServices}
${dotSubGraphs}
  ${dotLinks}
}`
  return dotGraph
}

function addSpaces(n: number): string {
  return _.fill(Array(n), '  ')
    .join('')
}

function convertSubSystemToDot(subSystem: System): string {
  let dotServices: string = convertServicesToDot(subSystem.services, 2)
  let dotLinks: string = convertLinksToDot(subSystem.links, 2)
  let dotGraph = `  subgraph cluster_${subSystem.name} {
    label = "cabinet ${subSystem.name}";
    fontname="Arial";
    style="filled";
    color="#f8ecc9";
    ${dotServices}
    ${dotLinks}
  }`
  return dotGraph
}

function convertServicesToDot(services: Service[], identation: number): string {
  return services
    .map((service) => {
      const id = makeId(service.name)
      const styling = getServiceStyling(service)
      return `${id} [${styling},fontname="Arial"]`
    })
    .join(';\n' + addSpaces(identation)) + (services.length > 0 ? ';' : '')
}

function getServiceStyling(service: Service): string {
  if (service.name.startsWith('exchange')) {
    const label = service.name.substring('exchange '.length)
    return `shape=cylinder,style=filled,fillcolor=lightgrey,label="${label}"`
  } else {
    const urlProp = service.properties ? service.properties.find(prop => prop.name === 'url') : null
    const optionalUrl = urlProp ? `,URL="${urlProp.value}"` : ''
    return `shape=box,style=filled,fillcolor=gold,label="${service.name}"${optionalUrl}`
  }
}

function convertLinksToDot(links: Link[], identation: number): string {
  return links.map((link) => {
    const sourceId = makeId(link.sourceName)
    const targetId = makeId(link.targetName)
    const styling = getLinkStyling(link)
    return `${sourceId} -> ${targetId} ${styling}`
  }).join(';\n' + addSpaces(identation)) + (links.length > 0 ? ';' : '')
}

function getLinkStyling(link: Link): string {
  if (link.communicationType === 'sync') {
    return '[color=red,arrowhead=normal]'
  } else {
    return ''
  }
}

function makeId(value: string) {
  return value.replace(/[ -\.]/g, '_')
}
