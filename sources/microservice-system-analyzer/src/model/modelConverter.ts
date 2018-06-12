import { Node, Edge, Props } from './nodeModel'
import { System, Service, Link, Property } from './modelClasses'
import * as _ from 'lodash'

export class ModelConverter {
  convertSystemToNode(system: System): Node {
    const containedNodes = _.union(this.convertServicesToNodes(system.services), this.convertSubSystemsToNodes(system.subSystems))
    const systemNode = new Node(system.name, 'system', containedNodes)
    this.convertLinksToEdges(system.links, systemNode)
    return systemNode
  }

  private convertServicesToNodes(services: Service[]): Node[] {
    if (!services) return []

    return services.map(service => this.convertServiceToNode(service))
  }

  private convertServiceToNode(service: Service): Node {
    if (service.name.startsWith('exchange ')) {
      const name = service.name.substring('exchange '.length)
      return new Node(name, 'exchange', null, null, this.convertProperties(service.properties))
    } else {
      return new Node(service.name, 'microservice', null, null, this.convertProperties(service.properties))
    }
  }

  private convertSubSystemsToNodes(subSystems: System[]): Node[] {
    if (!subSystems) return []

    return subSystems.map(subSystem => this.convertSystemToNode(subSystem))
  }

  private convertProperties(properties: Property[]): Props {
    if (!properties) return {}

    const props: Props = {}
    properties.forEach(property => {
      props[property.name] = property.value
    })
    return props
  }

  private convertLinksToEdges(links: Link[], ownerNode: Node) {
    if (!links) return []

    return links.map(link => {
      const props: Props = {
        communicationType: link.communicationType
      }
      const source = ownerNode.addNodeIfNew(link.sourceName, 'microservice') // TODO: exchange
      const target = ownerNode.addNodeIfNew(link.targetName, 'microservice')

      ownerNode.addEdge(new Edge(source, target, props))
    })
  }
}
