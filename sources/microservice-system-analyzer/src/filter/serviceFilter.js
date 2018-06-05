const log = require('npmlog')
const configRepository = require('../config/configRepository')

/** returns the system without services defined in the environment variable
 * for ignored services (IGNORED_SERVICES). any service name which contains
 * any value listed in IGNORED_SERVICES is removed (even if just a part
 * of a service name contains any value).
 */
function filterSystem (originalSystem) {
  let system = originalSystem.copy()

  if (configRepository.getIgnoredServices()) {
    removeServicesWhereNameContains(system, configRepository.getIgnoredServices())
  }

  removeServicesByName(system, [''])

  return system
}

/** returns the system without services that fully match one of the provided names
 * or that start or end with one of these names. all links that refer to the removed
 * services are removed as well.
 */
function removeServicesWhereNameContains (system, names) {
  removeServicesByName(system, names)
  removeServicesByNameStartsWith(system, names)
  removeServicesByNameEndsWith(system, names)
}

/** returns the system without services that fully match one of the provided names.
 * all links that refer to the removed services are removed as well.
 */
function removeServicesByName (system, names) {
  names.forEach((serviceName) => {
    if (system.hasService(serviceName)) {
      log.info('service-filter', 'removing service ' + serviceName)
      system.removeServiceAndLinks(serviceName)
    }
  })
}

/** returns the system without services that start with one of the provided names.
 * all links that refer to the removed services are removed as well.
 */
function removeServicesByNameStartsWith (system, nameBeginnings) {
  removeServicesByCondition(system, nameBeginnings.map((nameBeginning) => {
    return (name) => name.startsWith(nameBeginning)
  }))
}

/** returns the system without services that end with one of the provided names.
 * all links that refer to the removed services are removed as well.
 */
function removeServicesByNameEndsWith (system, nameEndings) {
  removeServicesByCondition(system, nameEndings.map((nameEnding) => {
    return (name) => name.endsWith(nameEnding)
  }))
}

function removeServicesByCondition (system, conditions) {
  conditions.forEach((condition) => {
    system.services
      .filter((service) => condition(service.name))
      .forEach((service) => {
        log.info('service-filter', 'removing service ' + service.name)
        system.removeServiceAndLinks(service.name)
      })
  })
}

module.exports = {
  filterSystem,
  removeServicesByName,
  removeServicesByNameStartsWith,
  removeServicesByNameEndsWith
}
