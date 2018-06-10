export declare interface System {
  name: string
  services: Service[]
  links: Link[]
  subSystems: System[]
}

export declare interface Service {
  name: string
  properties: Property[]
}

export declare interface Property {
  name: string
  value: string
}

export declare interface Link {
  sourceName: string
  targetName: string
  communicationType: string
}
