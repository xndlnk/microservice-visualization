import { System, Microservice, MessageExchange, AsyncInfoFlow, Node, Edge } from '~/model/model'
import { V1SystemMerger } from '~/processor/V1SystemMerger'
import { createLogger } from '~/logging'
import * as _ from 'lodash'

const logger = createLogger('service-exchange-merger')

/** each provided systems is checked for microservices that are directly connected to an equally
 * named message exchange. each pair of such nodes is merged into one microservice node.
 */
export function mergeSystems(systems: System[]) {
  const result = new System(new V1SystemMerger().mergeSystemNames([], systems))
  const exchangesToMerge = getExchangesToMerge(systems)

  logger.info('services and exchanges to be merged: ', exchangesToMerge.map(exchange => exchange.getId()))

  systems.forEach(system => {
    system.getEdges().forEach(edge => {
      if (isOutgoingEdgeOfAnyExchange(edge, exchangesToMerge)) {
        logger.info('merging service ' + edge.getSource().getName() + ' with exchange ' + edge.getSource().getName())
        result.addEdgeWithNodesUniquely(
          new AsyncInfoFlow(new Microservice(edge.getSource().getName()), edge.getTarget()))
      } else if (!isIncomingEdgeOfAnyExchange(edge, exchangesToMerge)) {
        result.addEdgeWithNodesUniquely(edge)
      }
    })
  })

  systems.forEach(system => {
    system.getNodes().forEach(node => {
      if (!exchangesToMerge.find(exchange => exchange.getId() === node.getId())) {
        result.addNodeUniquely(node)
      }
    })
  })

  return result
}

function isOutgoingEdgeOfAnyExchange(edge: Edge, exchanges: MessageExchange[]) {
  return exchanges.some(exchange => exchange.getId() === edge.getSource().getId())
}

function isIncomingEdgeOfAnyExchange(edge: Edge, exchanges: MessageExchange[]) {
  return exchanges.some(exchange => exchange.getId() === edge.getTarget().getId())
}

function getExchangesToMerge(systems: System[]): MessageExchange[] {
  const allEdges = _.flatMap(systems, system => system.getEdges())

  return allEdges.filter(edge => connectsMicroserviceAndExchangeOfSameName(edge))
    .map(edge => edge.getTarget() as MessageExchange)
}

function connectsMicroserviceAndExchangeOfSameName(edge: Edge) {
  return edge.getSource().getName() === edge.getTarget().getName()
    && edge.getSource().getType() === 'Microservice'
    && edge.getTarget().getType() === 'MessageExchange'
}
