interface System {
  name: string
  services: Service[]
  links: Link[]
  subSystems: System[]
}

interface Service {
  name: string
  properties: Property[]
}

interface Property {
  name: string
  value: string
}

interface Link {
  sourceName: string
  targetName: string
  communicationType: string
}

export {
  System, Service, Property, Link
}
