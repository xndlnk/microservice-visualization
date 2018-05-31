const log = require('npmlog')
const logContext = 'feign-importer'
const System = require('../model/modelClasses').System
const fs = require('fs')
const configRepository = require('../config/configRepository')
const fileHelper = require('./fileHelper')

async function getSystemWithLinksInReverse () {
  return getSystem(true)
}

async function getSystem (reverseLinks) {
  let system = new System()
  let clients = await scanPathForFeignClients(configRepository.getSourceFolder())
  for (let client of clients) {
    let source = client.serviceName
    let target = client.feignClient

    if (reverseLinks) {
      let tmp = target
      target = source
      source = tmp
    }

    system.addLink(source, target, 'sync')
    log.info(logContext, 'adding link: %s -> %s', source, target)
  }
  return system
}

async function scanPathForFeignClients (path) {
  log.info(logContext, 'scanning for feign clients in ' + path)
  const javaFiles = await fileHelper.findJavaFiles(path)
  log.info(logContext, 'found ' + javaFiles.length + ' java files')

  const feignClients = []
  javaFiles.forEach((file) => {
    parseFeignClients(file, (clientName) => {
      const serviceName = fileHelper.getServiceNameFromPath(path, file)
      const client = { 'file': file, 'serviceName': serviceName, 'feignClient': clientName }
      feignClients.push(client)
      log.verbose(logContext, 'found feign client: %s', JSON.stringify(client, null, 2))
    })
  })

  return feignClients
}

function parseFeignClients (file, foundCallBack) {
  const fileContent = fs.readFileSync(file, 'utf8')

  const pattern = /@FeignClient\s*\(\s*(value\s*=)?\s*"(\w+)"/
  const match = fileContent.match(pattern)
  if (match) {
    const serviceName = match[2]
    foundCallBack(serviceName)
  }
}

module.exports = {
  getSystem,
  getSystemWithLinksInReverse
}
