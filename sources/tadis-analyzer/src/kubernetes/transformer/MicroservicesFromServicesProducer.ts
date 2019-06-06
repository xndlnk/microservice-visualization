import { Injectable, Logger } from '@nestjs/common'
import * as _ from 'lodash'

import { ConfigService } from '../../config/Config.service'
import { System } from '../../model/ms'
import { KubernetesApiService } from '../api/api.service'
import { Metadata } from 'src/model/core'

@Injectable()
export class MicroservicesFromServicesProducer {
  private readonly logger = new Logger(MicroservicesFromServicesProducer.name)

  constructor(
    private readonly config: ConfigService,
    private readonly apiService: KubernetesApiService
  ) { }

  public async transform(system: System): Promise<System> {
    return this.getSystem()
  }

  private async getSystem(): Promise<System> {
    const namespace = this.config.getKubernetesNamespace()
    try {
      const services = await this.apiService.getServices(namespace)
      const pods = await this.apiService.getPods(namespace)

      const system = new System(namespace)
      services.items.forEach(item => {
        const serviceName = item.metadata.name
        // TODO: is this naming scheme with the dash in the pod name a standard or project-specific?
        // i.e. does is it need to be configurable?
        if (this.isPodExisting(pods, serviceName + '-')) {
          const metadata: Metadata = {
            transformer: MicroservicesFromServicesProducer.name,
            context: 'service ' + serviceName
          }

          system.addMicroService(serviceName, undefined, metadata)
          this.logger.log('added microservice ' + serviceName)
        } else {
          this.logger.log('not adding microservice ' + serviceName + ' because no pods were found')
        }
      })
      return system
    } catch (err) {
      this.logger.error('Failed to get services from Kubernetes API: ', err.message)
      return new System(namespace)
    }
  }

  private isPodExisting(pods: any, podNamePrefixToCheck: string): boolean {
    return pods.items && pods.items.find(item => item.metadata.name.startsWith(podNamePrefixToCheck)) !== undefined
  }
}
