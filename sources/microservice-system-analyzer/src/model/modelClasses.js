class System {
  constructor (links) {
    this.services = []
    this.links = []
    this.subSystems = []
    this.name = 'system'

    if (links) {
      links.forEach((link) => {
        this.addLink(link.sourceName, link.targetName, link.communicationType)
      })
    }
  }

  copy () {
    let system = new System()
    system.name = this.name

    this.services.forEach((service) => {
      system.services.push(new Service(service.name))
      let serviceCopy = system.getService(service.name)
      service.properties.forEach((property) => {
        serviceCopy.addProperty(property.name, property.value)
      })
    })

    this.links.forEach((link) => system.links.push(new Link(link.sourceName, link.targetName, link.communicationType)))

    this.subSystems.forEach((subSystem) => system.subSystems.push(subSystem.copy()))

    return system
  }

  addService (name) {
    if (!this.hasService(name)) {
      this.services.push(new Service(name))
    }
  }

  getService (name) {
    return this.services.find((service) => service.name === name)
  }

  hasService (name) {
    return this.services.some((service) => service.name === name)
  }

  removeService (name) {
    this.services = this.services.filter((service) => !(service.name === name))
  }

  removeServiceAndLinks (name) {
    this.removeService(name)
    this.links = this.links.filter((link) => !(link.sourceName === name || link.targetName === name))
  }

  removeIsolatedServices () {
    this.services = this.services.filter((service) => this.isLinkedToService(service.name))
  }

  renameService (oldName, newName) {
    this.getService(oldName).name = newName
    this.links.filter((link) => link.sourceName === oldName).forEach((link) => { link.sourceName = newName })
    this.links.filter((link) => link.targetName === oldName).forEach((link) => { link.targetName = newName })
  }

  isLinkedToService (name) {
    return this.links.some((link) => link.sourceName === name || link.targetName === name)
  }

  addLink (sourceName, targetName, communicationType) {
    this.addService(sourceName)
    this.addService(targetName)
    if (!this.hasLink(sourceName, targetName, communicationType)) {
      this.links.push(new Link(sourceName, targetName, communicationType))
    }
  }

  removeLink (sourceName, targetName) {
    this.links = this.links.filter((link) => !(link.sourceName === sourceName && link.targetName === targetName))
  }

  hasLink (sourceName, targetName, communicationType) {
    if (communicationType) {
      return this.links.some((link) => link.sourceName === sourceName && link.targetName === targetName &&
        link.communicationType === communicationType)
    } else {
      return this.links.some((link) => link.sourceName === sourceName && link.targetName === targetName)
    }
  }

  hasSubSystem (name) {
    return this.subSystems.some((subSystem) => subSystem.name === name)
  }

  addSubSystem (name) {
    if (!this.hasSubSystem(name)) {
      let subSystem = new System()
      subSystem.name = name
      this.subSystems.push(subSystem)
      return subSystem
    } else {
      return this.getSubSystem(name)
    }
  }

  getSubSystem (name) {
    return this.subSystems.find((subSystem) => subSystem.name === name)
  }
}

class Service {
  constructor (name, properties) {
    this.name = name // service names must be globally unique in the root system and in all sub systems
    this.properties = []

    if (properties) {
      properties.forEach((property) => {
        this.addProperty(property.name, property.value)
      })
    }
  }

  copy () {
    return new Service(this.name, this.properties)
  }

  addProperty (name, value) {
    this.properties.push(new Property(name, value))
  }

  hasProperty (name) {
    return this.properties.find((prop) => prop.name === name) != null
  }

  getPropertyValue (name) {
    let property = this.properties.find((prop) => prop.name === name)
    if (property) {
      return property.value
    } else {
      return null
    }
  }
}

class Link {
  constructor (sourceName, targetName, communicationType) {
    this.sourceName = sourceName
    this.targetName = targetName
    this.communicationType = communicationType
  }
}

class Property {
  constructor (name, value) {
    this.name = name
    this.value = value
  }
}

module.exports = {
  System,
  Service,
  Link,
  Property
}
