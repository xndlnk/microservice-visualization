import * as axios from 'axios'
import * as NodeCache from 'node-cache'
import { ConsulAnalyzerServiceResolver } from './ConsulAnalyzerServiceResolver'
import { INode } from '../domain/model'

export class SystemFetcher {

  private readonly cache
  private readonly SYSTEM_CACHE_KEY = 'system'

  constructor(private directSystemUrl: string, private alternativeResolver?: ConsulAnalyzerServiceResolver) {
    if (process.env.CACHE_TTL_SECONDS) {
      const cacheTTLSeconds = Number(process.env.CACHE_TTL_SECONDS)
      this.cache = new NodeCache({ stdTTL: cacheTTLSeconds })
    } else {
      this.cache = new NodeCache()
    }
  }

  async fetchSystem(): Promise<INode> {
    if (this.isProduction()) {
      let cachedResponse = this.cache.get(this.SYSTEM_CACHE_KEY)
      if (cachedResponse) {
        console.log('using cached system')
        return cachedResponse
      }
    }

    const systemUrl = await this.getSystemUrl()
    if (!systemUrl) return null

    console.log('fetching system via url ' + systemUrl)
    try {
      let response = await axios.default.get(systemUrl)
      let system = response.data
      if (this.isProduction()) {
        console.log('caching system')
        this.cache.set(this.SYSTEM_CACHE_KEY, system)
      }
      return system
    } catch (error) {
      console.log('error: ' + error)
    }

    return null
  }

  private isProduction() {
    return process.env.NODE_ENV && process.env.NODE_ENV === 'production'
  }

  private async getSystemUrl(): Promise<string> {
    if (this.directSystemUrl) {
      return this.directSystemUrl
    } else if (this.alternativeResolver) {
      return this.alternativeResolver.resolveAnalyzerServiceUrl()
    }
  }
}
