import { System } from '~/model/model'

export class ManualAdditionsMarker {
  markSystem(system: System): System {
    system.getNodes().forEach(node => node.addProperty('warning', 'manual addition'))
    system.getEdges().forEach(edge => edge.addProperty('warning', 'manual addition'))
    system.getSubSystems().forEach(subSystem => this.markSystem(subSystem))
    return system
  }
}
