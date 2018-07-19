import * as v1 from '~/model/model'
import * as v0 from './modelClasses'
import * as _ from 'lodash'

export class V0toV1ModelConverter {

  convertSystem(v0system: v0.System): v1.System {
    const systemNode = new v1.System(v0system.name)

    this.convertServices(v0system.services).forEach(service => systemNode.getNodes().push(service))
    this.convertExchanges(v0system.services).forEach(exchange => systemNode.getNodes().push(exchange))
    this.convertSubSystems(v0system.subSystems).forEach(subSystem => systemNode.getNodes().push(subSystem))

    this.convertAndAddLinks(v0system.links, systemNode)
    return systemNode
  }

  private convertServices(v0services: v0.Service[]): v1.Microservice[] {
    if (!v0services) return []

    return v0services.filter(v0service => !v0service.name.startsWith('exchange '))
      .map(v0service => new v1.Microservice(v0service.name, this.convertProperties(v0service.properties)))
  }

  private convertExchanges(v0services: v0.Service[]): v1.MessageExchange[] {
    if (!v0services) return []

    return v0services.filter(v0service => v0service.name.startsWith('exchange '))
      .map(v0service => new v1.MessageExchange(v0service.name.substring('exchange '.length), this.convertProperties(v0service.properties)))
  }

  private convertSubSystems(v0subSystems: v0.System[]): v1.System[] {
    if (!v0subSystems) return []

    return v0subSystems.map(v0subSystem => this.convertSystem(v0subSystem))
  }

  private convertProperties(v0properties: v0.Property[]): v1.Properties {
    if (!v0properties) return {}

    const v1properties: v1.Properties = {}
    v0properties.forEach(property => {
      v1properties[property.name] = property.value
    })
    return v1properties
  }

  private convertAndAddLinks(links: v0.Link[], owner: v1.System) {
    if (!links) return []

    return links.map(link => {
      const source = this.deepFindNodeById(owner, this.getServiceId(link.sourceName))
      const target = this.deepFindNodeById(owner, this.getServiceId(link.targetName))

      if (source == null) {
        console.log('WARN: could not find source ' + this.getServiceId(link.sourceName))
        return {}
      }

      if (target == null) {
        console.log('WARN: could not find target ' + this.getServiceId(link.targetName))
        return {}
      }

      if (link.communicationType === 'async') {
        owner.getEdges().push(new v1.AsyncInfoFlow(source, target))
      } else if (link.communicationType === 'sync') {
        owner.getEdges().push(new v1.SyncInfoFlow(source, target))
      } else {
        console.log('WARN: unknown communicationType ' + link.communicationType)
      }
    })
  }

  private getServiceId(v0serviceId: string): string {
    if (v0serviceId.startsWith('exchange ')) {
      return 'MessageExchange_' + v0serviceId.substring('exchange '.length)
    } else {
      return 'Microservice_' + v0serviceId
    }
  }

  private deepFindNodeById(node: v1.Node, id: string): v1.Node {
    const subNode = node.getNodes().find(subNode => subNode.getId() === id)
    if (subNode) {
      return subNode
    } else {
      return node.getNodes()
        .map(subNode => this.deepFindNodeById(subNode, id))
        .find(subNode => subNode !== undefined)
    }
  }
}
