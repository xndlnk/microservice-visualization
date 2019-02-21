import { System, Microservice, AsyncInfoFlow, Node, Edge, Properties } from '~/model/model'
import { createLogger } from '~/logging'
import * as _ from 'lodash'

const logger = createLogger('service-exchange-merger')

export class ServiceExchangeMerger {

  mergeServiceAndExchangeOfSameNameToService(system: System): System {
    const result = new System(system.getName())

    const exchangesToMerge: Node[] = system.getEdges()
      .filter(edge => this.connectsMicroserviceAndExchangeOfSameName(edge))
      .map(edge => edge.getTarget())

    system.getEdges()
      .filter(edge => !this.connectsMicroserviceAndExchangeOfSameName(edge))
      .forEach(edge => {
        if (this.edgeHasSource(edge, exchangesToMerge)) {
          const exchangeToMerge = edge.getSource()
          const mergedService = new Microservice(exchangeToMerge.getName(), exchangeToMerge.getProperties())

          const edgeRedirected = new AsyncInfoFlow(mergedService, edge.getTarget())
          result.addEdgeWithNodesUniquely(edgeRedirected)

          this.logEdgeReplacement(edge, edgeRedirected)
        } else if (this.edgeHasTarget(edge, exchangesToMerge)) {
          const exchangeToMerge = edge.getTarget()
          const mergedService = new Microservice(exchangeToMerge.getName(), exchangeToMerge.getProperties())

          const edgeRedirected = new AsyncInfoFlow(edge.getSource(), mergedService)
          result.addEdgeWithNodesUniquely(edgeRedirected)

          this.logEdgeReplacement(edge, edgeRedirected)
        } else {
          result.addEdgeWithNodesUniquely(edge)
        }
      })

    system.getNodes().forEach(node => {
      if (!exchangesToMerge.find(exchange => exchange === node)) {
        result.addNodeUniquely(node)
      }
    })

    return result
  }

  private edgeHasSource(edge: Edge, nodes: Node[]) {
    return nodes.find(exchange => exchange === edge.getSource())
  }

  private edgeHasTarget(edge: Edge, nodes: Node[]) {
    return nodes.find(exchange => exchange === edge.getTarget())
  }

  private logEdgeReplacement(originalEdge: Edge, redirectedEdge: Edge) {
    logger.info('replacing edge ' + originalEdge.getSource().getId() + ' -> ' + originalEdge.getTarget().getId()
      + ' with ' + redirectedEdge.getSource().getId() + ' -> ' + redirectedEdge.getTarget().getId())
  }

  private connectsMicroserviceAndExchangeOfSameName(edge: Edge) {
    return edge.getSource().getName() === edge.getTarget().getName()
      && edge.getSource().getType() === 'Microservice'
      && edge.getTarget().getType() === 'MessageExchange'
  }
}
