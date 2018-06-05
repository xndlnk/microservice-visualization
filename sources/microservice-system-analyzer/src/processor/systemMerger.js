const System = require('../model/modelClasses').System

/** merges the provided systems into one system and returns it.
 * each service and each link that is contained in any of the provided systems
 * will be added to the merged system. properties of the services and links
 * are not merged.
 */
function mergeSystems (systems) {
  const result = new System()
  systems.forEach((system) => {
    system.links.forEach((link) => result.addLink(link.sourceName, link.targetName, link.communicationType))
    system.services.forEach((service) => result.addService(service.name))
  })
  return result
}

module.exports = {
  mergeSystems
}
