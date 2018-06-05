const randomWord = require('random-word')

/** returns a system where all service names are changed to random words. */
function getSystem (originalSystem) {
  const system = originalSystem.copy()
  const obfuscationCache = new Map()

  obfuscateSystem(system, obfuscationCache)

  return system
}

function obfuscateSystem (system, obfuscationCache) {
  system.name = obfuscateNameOnce(system.name, obfuscationCache)

  system.services.forEach((service) => {
    service.name = obfuscateNameOnce(service.name, obfuscationCache)
    service.properties.forEach((prop) => {
      if (prop.name === 'cabinet') {
        prop.value = obfuscateNameOnce(prop.value, obfuscationCache)
      }
    })
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
  const existingObfuscatedName = obfuscationCache.get(name)
  if (existingObfuscatedName) {
    return existingObfuscatedName
  } else {
    const obfuscatedName = obfuscateName(name)
    obfuscationCache.set(name, obfuscatedName)
    return obfuscatedName
  }
}

function obfuscateName (name) {
  if (name.startsWith('exchange')) {
    return 'exchange ' + randomWord()
  } else {
    return randomWord()
  }
}

module.exports = {
  getSystem
}
