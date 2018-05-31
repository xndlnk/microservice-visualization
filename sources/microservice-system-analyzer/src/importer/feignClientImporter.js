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
    if (!reverseLinks) {
      system.addLink(client.serviceName, client.feignClient, 'sync')
    } else {
      system.addLink(client.feignClient, client.serviceName, 'sync')
    }
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
      feignClients.push({ 'file': file, 'serviceName': serviceName, 'feignClient': clientName })
    })
  })

  log.silly(logContext, 'found %d feign clients: %s', feignClients.length, JSON.stringify(feignClients, null, ' '))
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
