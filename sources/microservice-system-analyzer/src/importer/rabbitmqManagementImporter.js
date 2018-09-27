const request = require('request-promise-native')
const log = require('npmlog')
const System = require('../model/modelClasses').System
const configRepository = require('../config/configRepository')

/** extracts binding information of queues and exchanges via RabbitMQ management api. */
async function getSystem () {
  const queues = await getQueues()

  const bindingPromises = queues.map((queue) => getBinding(queue))
  const bindings = await Promise.all(bindingPromises)

  const system = convertBindingsToSystem(bindings)
  log.verbose('rabbitmq', 'found %d async links.', system.links.length)
  system.links.forEach((link) => { log.verbose('rabbitmq', 'found link: %s => %s', link.source, link.target) })

  return system
}

function convertBindingsToSystem (bindings) {
  const system = new System()
  bindings.filter(binding => binding.exchange !== '')
    .forEach((binding) => {
      const source = 'exchange ' + binding.exchange
      const target = binding.queue.substring(0, binding.queue.indexOf('.'))
      system.addLink(source, target, 'async')
      log.info('rabbitmq', 'adding link: %s -> %s', source, target)
    })
  return system
}

async function getQueues () {
  const url = getBaseUrl() + '/api/queues/'

  const queues = await sendRequest(url, 'GET')
  if (!queues) return []

  return queues.map((queue) => { return queue.name })
}

function getBaseUrl () {
  return configRepository.getRabbitMqPath()
}

async function getBinding (queueName) {
  const vhost = '/'
  const url = getBaseUrl() + '/api/queues/' + encodeURIComponent(vhost) + '/' + encodeURIComponent(queueName) + '/bindings/'
  const bindingsData = await sendRequest(url, 'GET')

  let binding = { 'exchange': '', 'queue': queueName }
  const firstBindingHavingSource = bindingsData.find((element) => { return element.source !== '' })
  if (firstBindingHavingSource) {
    binding = { 'exchange': firstBindingHavingSource.source, 'queue': queueName }
  }
  log.info('rabbitmq', 'found binding from queue %s to exchange %s', binding.queue, binding.exchange)

  return binding
}

async function sendRequest (url, method) {
  const options = {
    method: method,
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
