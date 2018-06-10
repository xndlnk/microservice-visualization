import { Node, Edge, Props } from './nodeModel'
import { System, Service, Link, Property } from './modelClasses'

export class ModelConverter {
  static convertSystemToNode(system: System): Node {
    console.log(system.name)
    return null
  }
}
