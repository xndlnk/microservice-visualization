import { SystemFetcher } from './SystemFetcher'
import { system as exampleSystem } from './exampleSystem'
import { RandomWordAnonymizer } from './RandomWordAnonymizer'
import * as express from 'express'

export class SystemProvider {

  private lastFetchedSystem = null
  private lastFetchedTimestamp = null

  constructor(private systemFetcher: SystemFetcher) {}

  async getSystem(query?: any): Promise<any> {
    let system = null

    if (query.local || this.useLocalFile()) {
      console.log('using example system from local file')
      system = exampleSystem
    }

    if (query.last) {
      console.log('using last fetched system from memory')
      system = this.lastFetchedSystem
    }

    if (!system) {
      system = await this.systemFetcher.fetchSystem()
      if (system) {
        this.lastFetchedSystem = system
        this.lastFetchedTimestamp = new Date()
      }
    }

    if (query.anonymize) {
      const anonymizer = new RandomWordAnonymizer()
      system = anonymizer.getAnonymizedSystem(system)
    }

    return system
  }

  getMessageForFallbackToLastFetchedSystem(req: express.Request) {
    if (!this.lastFetchedSystem) {
      return 'could not fetch the current system :/'
    }

    const url = req.url.lastIndexOf('?last=1') > 0 ? req.url : req.url + '?last=1'
    const time = this.lastFetchedTimestamp.toJSON()
    return 'could not fetch the current system. '
      + 'the last successful fetch occured at time ' + time + '. '
      + 'you can view this last fetch via the following url: '
          + `<a href="${url}">${url}</a>`
  }

  private useLocalFile() {
    return process.argv.length > 2 && process.argv[2] === 'local'
  }

}
