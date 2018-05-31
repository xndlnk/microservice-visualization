const request = require('request-promise-native')
const log = require('npmlog')
const System = require('../model/modelClasses').System
const configRepository = require('../config/configRepository')

async function getSystem () {
  let queues = await getQueues()

  let bindingPromises = queues.map((queue) => getBinding(queue))
  let bindings = await Promise.all(bindingPromises)

  let system = convertBindingsToSystem(bindings)
  log.verbose('rabbitmq', 'found %d async links.', system.links.length)
  system.links.forEach((link) => { log.verbose('rabbitmq', 'found link: %s => %s', link.source, link.target) })

  return system
}

function convertBindingsToSystem (bindings) {
  let system = new System()
  bindings.forEach((binding) => {
    let source = binding.exchange
    let target = binding.queue.substring(0, binding.queue.indexOf('.'))
    system.addLink(source, target, 'async')
  })
  return system
}

async function getQueues () {
  let url = getBaseUrl() + '/api/queues/'

  let queues = await sendRequest(url, 'GET')
  if (!queues) return []

  return queues.map((queue) => { return queue.name })
}

function getBaseUrl () {
  return configRepository.getRabbitMqPath()
}

async function getBinding (queueName) {
  let vhost = '/'
  let url = getBaseUrl() + '/api/queues/' + encodeURIComponent(vhost) + '/' + encodeURIComponent(queueName) + '/bindings/'
  let data = await sendRequest(url, 'GET')

  let binding = { 'exchange': '', 'queue': queueName }
  const elementWithSource = data.find((element) => { return element.source !== '' })
  if (elementWithSource) {
    binding = { 'exchange': elementWithSource.source, 'queue': queueName }
  }
  log.silly('rabbitmq', 'found binding from queue %s to exchange %s', binding.exchange, binding.queue)

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
