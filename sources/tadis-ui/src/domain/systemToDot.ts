import { Node, Edge } from './model'
import * as _ from 'lodash'

export interface Options {
  urlExtractor: (node: Node) => string
}

export class SystemToDotConverter {
  private readonly manualElementsTransformerName = 'ManualElementsProducer'

  constructor(private options?: Options) { }

  convertSystemToDot(system: Node): string {
    let dotNodes: string = this.convertNodesToDot(this.getNonSubSystemNodes(system), 1)

    let dotSubGraphs: string = this.getSubSystemNodes(system)
      .map((subSystem) => this.convertSubSystemToDot(subSystem))
      .join('\n')

    let dotLinks: string = this.convertEdgesToDot(system.getEdges(), 1)

    // splines=ortho;
    // splines=polyline;
    // edge[dir=both, arrowhead="normal", arrowtail="dot"];
    // INFO: don't change indentation below. it is important!
    let dotGraph: string = `strict digraph {
    size="40"
    ranksep=1;
    newrank=true;
    splines=polyline;
    edge [fontname="Arial"];
  ${dotNodes}
${dotSubGraphs}
  ${dotLinks}
}`
    return dotGraph
  }

  private getSubSystemNodes(node: Node): Node[] {
    return node.getNodes().filter(node => node.hasNodes())
  }

  private getNonSubSystemNodes(node: Node): Node[] {
    return node.getNodes().filter(node => !node.hasNodes())
  }

  private convertSubSystemToDot(node: Node): string {
    let dotNodes: string = this.convertNodesToDot(node.getNodes(), 2)
    let dotEdges: string = this.convertEdgesToDot(node.getEdges(), 2)
    const url = this.getUrlOrEmpty(node)
    const optionalUrl = url ? url + ';' : ''

    // INFO: don't change indentation below. it is important!
    let dotGraph = `  subgraph cluster_${node.getName()} {
    label = "cabinet ${node.getName()}";
    fontname = "Arial";
    style = "filled";
    color = "#f8ecc9";
    id = "${node.id}";
    ${optionalUrl}
    ${dotNodes}
    ${dotEdges}
  }`
    return dotGraph
  }

  private convertNodesToDot(nodes: Node[], indentation: number): string {
    const dotNodes = nodes
      .map((node) => {
        const id = makeId(node.id)
        const styling = this.getNodeStyling(node)
        return `${id} [${styling},fontname="Arial"]`
      })

    return dotNodes.join(';\n' + addSpaces(indentation)) + (nodes.length > 0 ? ';' : '')
  }

  private getNodeStyling(node: Node): string {
    const url = this.getUrlOrEmpty(node)
    const optionalUrl = url ? ',' + url : ''

    if (node.type === 'MessageExchange') {
      return `shape=cylinder,style=filled,fillcolor=lightgrey,id="${node.id}",label="${node.getName()}"${optionalUrl}`
    } else if (this.isNodeManuallyAdded(node)) {
      return `shape=box,style=dashed,fillcolor="white",id="${node.id}",label="${node.getName()}"${optionalUrl}`
    } else if (node.type === 'MicroService') {
      // TODO: develop concept for supporting configurable styling based on properties.
      const color = this.getFillColorForNode(node)
      return `shape=box,style=striped,fillcolor="${color}",id="${node.id}",label="${node.getName()}"${optionalUrl}`
    } else {
      return `shape=egg,style=filled,fillcolor="white",id="${node.id}",label="${node.getName()}"${optionalUrl}`
    }
  }

  private isNodeManuallyAdded(node: Node): boolean {
    const metadata = node.getProp('metadata', null)
    return metadata && metadata.transformerName === this.manualElementsTransformerName
  }

  private getFillColorForNode(node: Node): string {
    const defaultColor = 'gold'
    let color = defaultColor
    if (node.getProp('shared', null)) {
      const lightGreen = '#9eebcf'
      color = lightGreen
    }
    const sourceLocation = node.getProp('sourceLocation', null)
    if (typeof sourceLocation === 'string' && sourceLocation.length === 0) {
      const lightRed = '#ff725c'
      color = color + ':' + lightRed
    }
    if (node.getProp('reduced', null)) {
      color = color + ':' + 'lightgrey'
    }
    return color
  }

  private getUrlOrEmpty(node: Node): string {
    const url = this.options ? this.options.urlExtractor(node) : null
    return url ? `URL="${url}"` : ''
  }

  private convertEdgesToDot(edges: Edge[], identation: number): string {
    return edges.map((edge) => {
      const sourceId = makeId(edge.sourceId)
      const targetId = makeId(edge.targetId)
      const styling = this.getEdgeStyling(edge)
      return `${sourceId} -> ${targetId} ${styling}`
    }).join(';\n' + addSpaces(identation)) + (edges.length > 0 ? ';' : '')
  }

  private getEdgeStyling(edge: Edge): string {
    const id = makeId(edge.sourceId + '_' + edge.targetId)
    const optionalStyle = this.getEdgeStyleOrEmpty(edge)
    if (edge.type === 'SyncInfoFlow') {
      const optionalLabel = this.getEndpointsLabelOrEmpty(edge)
      return `[id="${id}",color=red,arrowhead=normal${optionalLabel}${optionalStyle}]`
    } else {
      return `[id="${id}"${optionalStyle}]`
    }
  }

  private getEdgeStyleOrEmpty(edge: Edge): string {
    if (this.isEdgeManuallyAdded(edge)) {
      return ',style=dashed'
    } else {
      return ''
    }
  }

  private isEdgeManuallyAdded(edge: Edge): boolean {
    return edge.properties
      && edge.properties.metadata
      && edge.properties.metadata.transformerName === this.manualElementsTransformerName
  }

  private getEndpointsLabelOrEmpty(edge: Edge): string {
    if (edge.properties && edge.properties.definedEndpoints) {
      const text = edge.properties.definedEndpoints
        .map(endpoint => {
          const path = endpoint.path as string
          if (path.startsWith('/')) {
            return path.substr(0, 1) + path.substr(1).split('/').join('/\n')
          } else {
            return path.split('/').join('/\n')
          }
        })
        .join(',\n')
      return `,label="${text}"`
    }
    return ''
  }
}

function addSpaces(n: number): string {
  return _.fill(Array(n), '  ')
    .join('')
}

function makeId(value: string) {
  return value.replace(/[ -\.]/g, '_')
}
