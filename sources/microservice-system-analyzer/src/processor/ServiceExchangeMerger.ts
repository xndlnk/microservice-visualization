import { System, Microservice, MessageExchange, AsyncInfoFlow, Node, Edge } from '~/model/model'
import { V1SystemMerger } from '~/processor/V1SystemMerger'

/** each provided systems is checked for microservices that are directly connected to an equally
 * named message exchange. each pair of such nodes is merged into one microservice node.
 */
export function mergeSystems(systems: System[]) {
  const result = new System(new V1SystemMerger().mergeSystemNames([], systems))
  const exchangesToMerge = getExchangesToMerge(systems)

  console.log('exchangeServices: ' + exchangesToMerge)

  systems.forEach((system) => {
    system.getEdges().forEach(edge => {
      if (isEdgeTheSourceOfOneExchange(edge, exchangesToMerge)) {
        result.addEdgeWithNodesUniquely(
          new AsyncInfoFlow(new Microservice(edge.getSource().getName()), edge.getTarget()))
      } else if (!isEdgeTheTargetOfOneExchange(edge, exchangesToMerge)) {
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

function isEdgeTheSourceOfOneExchange(edge: Edge, exchanges: MessageExchange[]) {
  return exchanges.some(exchange => exchange.getId() === edge.getSource().getId())
}

function isEdgeTheTargetOfOneExchange(edge: Edge, exchanges: MessageExchange[]) {
  return exchanges.some(exchange => exchange.getId() === edge.getTarget().getId())
}

function isLinkTheSourceOfOneService(link, services) {
  return services.includes(link.sourceName)
}

function isLinkTheTargetOfOneService(link, services) {
  return services.includes(link.targetName)
}

function getExchangesToMerge(systems: System[]): MessageExchange[] {
  const exchangeServices: MessageExchange[] = []
  systems.forEach((system) => {
    system.getEdges().forEach(edge => {
      if (connectsMicroserviceAndExchangeOfSameName(edge)) {
        // TODO: refactor: use map
        exchangeServices.push(edge.getTarget() as MessageExchange)
      }
    })
  })
  return exchangeServices
}

function connectsMicroserviceAndExchangeOfSameName(edge: Edge) {
  return edge.getSource().getName() === edge.getTarget().getName()
    && edge.getSource().getType() === 'Microservice'
    && edge.getTarget().getType() === 'MessageExchange'
}

function hasLinkFromServiceToEquallyNamedExchange(link) {
  return 'exchange ' + link.sourceName === link.targetName
}

module.exports = {
  mergeSystems
}
