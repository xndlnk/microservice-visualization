import { Node, Edge, Props } from './nodeModel'
import { System, Service, Link, Property } from './modelClasses'

export class ModelConverter {
  convertSystemToNode(system: System): Node {
    return new Node(system.name,
      this.convertServicesToNodes(system.services),
      this.convertLinksToEdges(system.links))
  }

  private convertServicesToNodes(services: Service[]): Node[] {
    if (!services) return []

    return services.map(service => new Node(service.name))
  }

  private convertLinksToEdges(links: Link[]): Edge[] {
    if (!links) return []

    return links.map(link => new Edge(link.sourceName, link.targetName))
  }
}
