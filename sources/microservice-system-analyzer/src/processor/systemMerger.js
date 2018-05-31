const System = require('../model/modelClasses').System

function mergeSystems (systems) {
  let result = new System()
  systems.forEach((system) => {
    system.links.forEach((link) => result.addLink(link.sourceName, link.targetName, link.communicationType))
    system.services.forEach((service) => result.addService(service.name))
  })
  return result
}

module.exports = {
  mergeSystems
}
