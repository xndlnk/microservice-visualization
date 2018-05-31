const log = require('npmlog')

function getSystem (originalSystem) {
  let system = originalSystem.copy()
  let obfuscationCache = new Map()

  obfuscateSystem(system, obfuscationCache)

  return system
}

function obfuscateSystem (system, obfuscationCache) {
  system.name = obfuscateNameOnce(system.name, obfuscationCache)

  system.services.forEach((service) => {
    service.name = obfuscateNameOnce(service.name, obfuscationCache)
  })

  system.links.forEach((link) => {
    link.sourceName = obfuscateNameOnce(link.sourceName, obfuscationCache)
    link.targetName = obfuscateNameOnce(link.targetName, obfuscationCache)
  })

  system.subSystems.forEach((subSystem) => {
    obfuscateSystem(subSystem, obfuscationCache)
  })
}

function obfuscateNameOnce (name, obfuscationCache) {
  let existingObfuscatedName = obfuscationCache.get(name)
  if (existingObfuscatedName) {
    return existingObfuscatedName
  } else {
    let obfuscatedName = obfuscateName(name)
    obfuscationCache.set(name, obfuscatedName)
    return obfuscatedName
  }
}

function obfuscateName (name) {
  return name.split('').map((char) => {
    let randomCharCode = getRandomIntInclusive(97, 122)
    return String.fromCharCode(randomCharCode)
  }).join('')
}

function getRandomIntInclusive (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

module.exports = {
  getSystem
}
