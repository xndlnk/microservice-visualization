const System = require('../model/modelClasses').System

function mergeSystems (systems) {
  let result = new System()
  let exchangeServices = getExchangeServices(systems)

  console.log('exchangeServices: ' + exchangeServices)

  systems.forEach((system) => {
    system.links.forEach((link) => {
      if (isLinkTheSourceOfOneService(link, exchangeServices)) {
        let sourceNameWithoutExchange = getNameWithoutExchangePrefix(link.sourceName)
        result.addLink(sourceNameWithoutExchange, link.targetName, link.communicationType)
      } else if (!isLinkTheTargetOfOneService(link, exchangeServices)) {
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
  let exchangeServices = []
  systems.forEach((system) => {
    system.links.forEach((link) => {
      if (hasLinkFromServiceToEquallyNamedExchange(link)) {
        let exchangeTarget = link.targetName
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
