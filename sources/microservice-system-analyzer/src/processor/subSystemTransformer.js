const log = require('npmlog')
const logContext = 'subsystem-transformer'

/** returns a new system where each service of the provided system is contained in a parent service
 * named after the service property 'cabinet'.
*/
function transform (originalSystem) {
  const system = originalSystem.copy()

  system.services.forEach((service) => {
    const CABINET_PROPERTY = 'cabinet'
    if (service.hasProperty(CABINET_PROPERTY)) {
      const cabinet = service.getPropertyValue(CABINET_PROPERTY)
      system.addSubSystem(cabinet)
      moveServiceToSubSystem(system, service.name, cabinet)
      log.info(logContext, 'moving service ' + service.name + ' to subsystem ' + cabinet)
    }
  })

  return system
}

function moveServiceToSubSystem (system, serviceName, subSystemName) {
  const service = system.getService(serviceName)
  system.removeService(serviceName)
  const subSystem = system.getSubSystem(subSystemName)
  subSystem.addService(service.name)
  // TODO: reactoring needed -> this code should not be concerned with copying properties
  service.properties.forEach((property) => {
    subSystem.getService(service.name).addProperty(property.name, property.value)
  })

  getAllLinksForService(system, serviceName)
    .filter((link) => isSourceAndTargetServiceFullyContained(subSystem, link))
    .forEach((link) => {
      system.removeLink(link.sourceName, link.targetName)
      subSystem.addLink(link.sourceName, link.targetName, link.communicationType)
    })
}

function isSourceAndTargetServiceFullyContained (system, link) {
  return system.hasService(link.sourceName) && system.hasService(link.targetName)
}

function getAllLinksForService (system, serviceName) {
  return system.links.filter((link) => link.sourceName === serviceName || link.targetName === serviceName)
}

module.exports = {
  transform
}
