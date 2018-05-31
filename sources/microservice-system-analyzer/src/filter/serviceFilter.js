const log = require('npmlog')
const configRepository = require('../config/configRepository')

function filterSystem (originalSystem) {
  let system = originalSystem.copy()

  if (configRepository.getIgnoredServices()) {
    removeServicesWhereNameContains(system, configRepository.getIgnoredServices())
  }

  removeServicesByName(system, [''])

  return system
}

function removeServicesWhereNameContains (system, names) {
  removeServicesByName(system, names)
  removeServicesByNameStartsWith(system, names)
  removeServicesByNameEndsWith(system, names)
}

function removeServicesByName (system, names) {
  names.forEach((serviceName) => {
    if (system.hasService(serviceName)) {
      log.info('service-filter', 'removing service ' + serviceName)
      system.removeServiceAndLinks(serviceName)
    }
  })
}

function removeServicesByNameStartsWith (system, nameBeginnings) {
  removeServicesByCondition(system, nameBeginnings.map((nameBeginning) => {
    return (name) => name.startsWith(nameBeginning)
  }))
}

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
