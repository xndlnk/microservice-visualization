const log = require('npmlog')
const logContext = 'feign-importer'
const System = require('../model/modelClasses').System
const fs = require('fs')
const configRepository = require('../config/configRepository')
const fileHelper = require('./fileHelper')

/** returns the result of getSystem with reverseLinks flag set to true.
 * @see {@link getSystem}  */
async function getSystemWithLinksInReverse () {
  return getSystem(true)
}

/** analyzes all source code for feign client annotations and returns a system of services and links.
 * links are created with communication type 'sync.
 * requires environment variable SOURCE_FOLDER to be set to a path where the source code can be found.
 *
 * @param {boolean} reverseLinks - When the source code of a service A includes a feign annotation
 * to a service B, the communication takes place from A to B. If reverseLinks is true then all links
 * are reversed, i.e. the link in the example will be from B to A. This flag can be used to show
 * information flow instead of call flow.
 */
async function getSystem (reverseLinks) {
  const system = new System()
  const clients = await scanPathForFeignClients(configRepository.getSourceFolder())
  for (const client of clients) {
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
