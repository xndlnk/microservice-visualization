import { Injectable, Logger } from '@nestjs/common'
import * as Api from 'kubernetes-client'

const Client = Api.Client1_10
const logger = new Logger('KubernetesApiService')

import { ConfigService } from '../../../config/Config.service'

@Injectable()
export class KubernetesApiService {
  private readonly api: Api.ApiRoot

  constructor(private config: ConfigService) {
    if (process.env.NODE_ENV !== 'test') {
      this.api = new Client({ config: this.getKubeConfig() })
    }
  }

  public async getServices(namespace: string): Promise<any> {
    const response = await this.api.api.v1.namespace(namespace).services.get()
    if (response.statusCode !== 200) {
      throw new Error('Got invalid response from Kubernetes API: ' + response.statusCode)
    }

    return response.body
  }

  public async getPods(namespace: string): Promise<any> {
    const response = await this.api.api.v1.namespace(namespace).pods.get()
    if (response.statusCode !== 200) {
      throw new Error('Got invalid response from Kubernetes API: ' + response.statusCode)
    }

    return response.body
  }

  public async getDeployments(namespace: string): Promise<any> {
    const response = await this.api.apis.apps.v1.namespace(namespace).deployments.get()
    if (response.statusCode !== 200) {
      throw new Error('Got invalid response from Kubernetes API: ' + response.statusCode)
    }

    return response.body
  }

  private getKubeConfig() {
    if (process.env.KUBECONFIG != null) {
      logger.log('using KUBECONFIG in ' + process.env.KUBECONFIG)
      return Api.config.fromKubeconfig()
    } else {
      return Api.config.getInCluster()
    }
  }
}
