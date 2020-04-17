import { SystemFetcher } from './SystemFetcher'
import { largeDemoSystem } from '../exampleSystems/largeSystem'
import { system as simpleDemoSystem } from '../exampleSystems/simpleSystem'
import { RandomWordAnonymizer } from './RandomWordAnonymizer'
import { Node, INode } from '../domain/model'
import { GraphService } from '../domain/service'

export class SystemProvider {

  private lastFetchedSystem = null
  private lastFetchedTimestamp = null

  constructor(private systemFetcher: SystemFetcher) { }

  async getSystem(query?: any): Promise<Node> {
    let rawSystem: INode = null

    if (query['no-cache']) {
      this.systemFetcher.invalidateCache()
    }

    if (query.demo || this.useDemoFile()) {
      console.log('using demo system from local storage')
      rawSystem = simpleDemoSystem
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

  private useDemoFile() {
    return process.argv.length > 2 && process.argv[2] === 'local'
  }

}
