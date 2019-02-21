const System = require('../model/modelClasses').System

// DEPRECATED:

/** each provided systems is checked for services that are directly connected to an equally
 * named exchange service. each pair of founds services is merged into one.
 * an exchange service is a service whose name starts with 'exchange '.
 * the resulting system with merged services is returned.
 */
function mergeSystems (systems) {
  const result = new System()
  const exchangeServices = getExchangeServices(systems)

  console.log('exchangeServices: ' + exchangeServices)

  systems.forEach((system) => {
    system.links.forEach((link) => {
      if (isLinkTheSourceOfOneService(link, exchangeServices)) {
        const sourceNameWithoutExchange = getNameWithoutExchangePrefix(link.sourceName)
        result.addLink(sourceNameWithoutExchange, link.targetName, link.communicationType)

        const sourceService = result.getService(sourceNameWithoutExchange)
        // TODO: add property also in ServiceExchangeMerger.ts
        sourceService.setProperty('reduced', true)
        console.log('added reduced property to ' + sourceNameWithoutExchange)
      } else if (isLinkTheTargetOfOneService(link, exchangeServices)) {
        result.addService(link.sourceName)
        const sourceService = result.getService(link.sourceName)
        sourceService.setProperty('reduced', true)
        console.log('added reduced property to ' + sourceService)
      } else {
        result.addLink(link.sourceName, link.targetName, link.communicationType)
      }
    })
  })

  systems.forEach((system) => {
    system.services.forEach((service) => {
      if (!exchangeServices.includes(service.name)) {
        result.addService(service.name)
      }
    })
  })

  return result
}

function getNameWithoutExchangePrefix (name) {
  return name.substr('exchange '.length)
}

function isLinkTheSourceOfOneService (link, services) {
  return services.includes(link.sourceName)
}

function isLinkTheTargetOfOneService (link, services) {
  return services.includes(link.targetName)
}

function getExchangeServices (systems) {
  const exchangeServices = []
  systems.forEach((system) => {
    system.links.forEach((link) => {
      if (hasLinkFromServiceToEquallyNamedExchange(link)) {
        const exchangeTarget = link.targetName
        exchangeServices.push(exchangeTarget)
      }
    })
  })
  return exchangeServices
}

function hasLinkFromServiceToEquallyNamedExchange (link) {
  return 'exchange ' + link.sourceName === link.targetName
}

module.exports = {
  mergeSystems
}
