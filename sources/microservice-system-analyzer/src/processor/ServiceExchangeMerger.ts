import { System, Microservice, MessageExchange, AsyncInfoFlow, Node, Edge } from '~/model/model'
import { V1SystemMerger } from '~/processor/V1SystemMerger'
import { createLogger } from '~/logging'
import * as _ from 'lodash'

const logger = createLogger('service-exchange-merger')

export class ServiceExchangeMerger {

  /** each provided systems is checked for microservices that are directly connected to an equally
   * named message exchange. each pair of such nodes is merged into one microservice node.
   */
  mergeSystems(systems: System[]) {
    const result = new System(new V1SystemMerger().mergeSystemNames([], systems))
    const exchangesToMerge = this.getExchangesToMerge(systems)

    logger.info('names of services and exchanges to be merged: ' + exchangesToMerge.map(exchange => exchange.getName()).join(', '))

    this.mergeEdges(systems, exchangesToMerge)
      .forEach(edge => result.addEdgeWithNodesUniquely(edge))

    systems.forEach(system => {
      system.getNodes().forEach(node => {
        if (!exchangesToMerge.find(exchange => exchange.getId() === node.getId())) {
          result.addNodeUniquely(node)
        }
      })
    })

    return result
  }

  private mergeEdges(systems: System[], exchangesToMerge: MessageExchange[]): Edge[] {
    return this.getAllEdges(systems).map(edge => {
      if (this.isOutgoingEdgeOfAnyExchange(edge, exchangesToMerge)) {
        const newEdge = new AsyncInfoFlow(new Microservice(edge.getSource().getName()), edge.getTarget())
        logger.info('adding edge between ' + newEdge.getSource().getId() + ' and ' + newEdge.getTarget().getId())
        return newEdge
      } else if (!this.isIncomingEdgeOfAnyExchange(edge, exchangesToMerge)) {
        return edge
      } else {
        logger.info('skipping edge between ' + edge.getSource().getId() + ' and ' + edge.getTarget().getId())
        return null
      }
    })
    .filter(edge => edge != null)
  }

  private isOutgoingEdgeOfAnyExchange(edge: Edge, exchanges: MessageExchange[]) {
    return exchanges.some(exchange => exchange.getId() === edge.getSource().getId())
  }

  private isIncomingEdgeOfAnyExchange(edge: Edge, exchanges: MessageExchange[]) {
    return exchanges.some(exchange => exchange.getId() === edge.getTarget().getId())
  }

  private getExchangesToMerge(systems: System[]): MessageExchange[] {
    return this.getAllEdges(systems).filter(edge => this.connectsMicroserviceAndExchangeOfSameName(edge))
    .map(edge => edge.getTarget() as MessageExchange)
  }

  private getAllEdges(systems: System[]): Edge[] {
    return _.flatMap(systems, system => system.getEdges())
  }

  private connectsMicroserviceAndExchangeOfSameName(edge: Edge) {
    return edge.getSource().getName() === edge.getTarget().getName()
    && edge.getSource().getType() === 'Microservice'
    && edge.getTarget().getType() === 'MessageExchange'
  }
}
