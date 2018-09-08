import { SystemFetcher } from './SystemFetcher'
import { largeSystem } from '../exampleSystems/largeSystem'
import { RandomWordAnonymizer } from './RandomWordAnonymizer'
import { Node, INode } from '../domain/model'
import { GraphService } from '../domain/service'

export class SystemProvider {

  private lastFetchedSystem = null
  private lastFetchedTimestamp = null

  constructor(private systemFetcher: SystemFetcher) {}

  async getSystem(query?: any): Promise<Node> {
    let rawSystem: INode = null

    if (query.local || this.useLocalFile()) {
      console.log('using example system from local file')
      rawSystem = largeSystem
    }

    if (query.last) {
      console.log('using last fetched system from memory')
      rawSystem = this.lastFetchedSystem
    }

    if (!rawSystem) {
      rawSystem = await this.systemFetcher.fetchSystem()
      if (rawSystem) {
        this.lastFetchedSystem = rawSystem
        this.lastFetchedTimestamp = new Date()
      }
    }

    const system = Node.ofRawNode(rawSystem)

    if (query.anonymize) {
      const anonymizer = new RandomWordAnonymizer()
      anonymizer.anonymizeSystem(system)
    }

    GraphService.deepResolveNodesReferencedInEdges(system)
    return system
  }

  getLastFetchedTimestamp() {
    return this.lastFetchedTimestamp
  }

  private useLocalFile() {
    return process.argv.length > 2 && process.argv[2] === 'local'
  }

}
