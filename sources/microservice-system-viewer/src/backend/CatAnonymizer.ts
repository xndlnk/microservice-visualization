import * as catNames from '@pnkbrn/cat-names'

export class CatAnonymizer {
  private nameMapping = new Map()
  private allNames = catNames.getAllCatNames()
  private usedNames = 0

  getAnonymizedSystem(originalSystem) {
    const system = JSON.parse(JSON.stringify(originalSystem))

    this.anonymizeSystem(system)

    return system
  }

  anonymizeSystem(system) {
    system.name = this.getNewNameCached(system.name)

    system.services.forEach((service) => {
      service.name = this.getNewNameCached(service.name)
    })

    system.links.forEach((link) => {
      link.sourceName = this.getNewNameCached(link.sourceName)
      link.targetName = this.getNewNameCached(link.targetName)
    })

    system.subSystems.forEach((subSystem) => {
      this.anonymizeSystem(subSystem)
    })
  }

  getNewNameCached(name) {
    const cachedNewName = this.nameMapping.get(name)
    if (cachedNewName) {
      return cachedNewName
    } else {
      const newName = this.getNewName(name)
      this.nameMapping.set(name, newName)
      return newName
    }
  }

  getNewName(name) {
    if (this.usedNames > this.allNames.length) {
      console.log('WARN: no more names for anonymization left. using numbers.')
      this.usedNames++
      return '' + this.usedNames
    }

    let newName = catNames.getAllCatNames()[this.usedNames]
    console.log('replacing name ' + name + ' by ' + newName)
    this.usedNames++

    if (name.startsWith('exchange')) {
      return 'exchange ' + newName
    } else {
      return newName
    }
  }
}
