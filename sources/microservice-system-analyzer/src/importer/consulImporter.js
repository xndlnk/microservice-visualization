const log = require('npmlog')
const System = require('../model/modelClasses').System
const request = require('request-promise-native')
const configRepository = require('../config/configRepository')

/** returns a system which contains all services imported from consul.
 * requires the variable environment variable CONSUL_PATH to be set to the base path of a consul.
 */
async function getSystem () {
  const services = await getCatalogServices(configRepository.getConsulPath())

  const serviceNames = []
  for (let serviceName in services) {
    serviceNames.push(serviceName)
  }

  const nonConsulServiceNames = consulServicesRemoved(serviceNames)
  log.info('consul', 'found %d services: %s', nonConsulServiceNames.length, nonConsulServiceNames)

  const system = new System()
  nonConsulServiceNames.forEach((serviceName) => system.addService(serviceName))

  return system
}

function consulServicesRemoved (services) {
  return services.filter((service) => !service.startsWith('consul'))
}

async function getCatalogServices (consulPath) {
  const url = consulPath + '/v1/catalog/services'
  const services = sendRequest(url, 'GET')
  if (!services) return []
  else return services
}

async function sendRequest (url, method) {
  const options = {
    method: method,
    rejectUnauthorized: false, // TODO: please get rid of this dirty solution
    url: url
  }

  try {
    const response = await request(options)
    return JSON.parse(response)
  } catch (error) {
    throw new Error('sending request failed, using options: ' + JSON.stringify(options))
  }
}

module.exports = {
  getSystem
}
