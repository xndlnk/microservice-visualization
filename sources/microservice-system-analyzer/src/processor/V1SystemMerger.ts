import * as v1 from '~/model/model'
import * as v0 from '~/model/modelClasses'

export class V1SystemMerger {
  merge(v0systems: v0.System[], v1systems: v1.System[]): v1.System {
    const mergedSystem = new v1.System('merged')
    v1systems.forEach(v1system => {
      v1system.getNodes().forEach(node => mergedSystem.addNodeUniquely(node))
    })
    return mergedSystem
  }
}
