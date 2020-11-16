import { Injectable, Logger } from '@nestjs/common'
import * as Api from 'kubernetes-client'

const Client = Api.Client1_10
const logger = new Logger('KubernetesApiService')

@Injectable()
export class KubernetesApiService {
  private _api: Api.ApiRoot

  public async getServices(namespace: string): Promise<any> {
    const response = await this.getApiRoot().api.v1.namespace(namespace).services.get()
    if (response.statusCode !== 200) {
      throw new Error('Got invalid response from Kubernetes API: ' + response.statusCode)
    }

    return response.body
  }

  public async getPods(namespace: string): Promise<any> {
    const response = await this.getApiRoot().api.v1.namespace(namespace).pods.get()
    if (response.statusCode !== 200) {
      throw new Error('Got invalid response from Kubernetes API: ' + response.statusCode)
    }

    return response.body
  }

  public async getDeployments(namespace: string): Promise<any> {
    const response = await this.getApiRoot().apis.apps.v1.namespace(namespace).deployments.get()
    if (response.statusCode !== 200) {
      throw new Error('Got invalid response from Kubernetes API: ' + response.statusCode)
    }

    return response.body
  }

  private getApiRoot(): Api.ApiRoot {
    if (!this._api) {
      this._api = new Client({ config: this.getKubeConfig() })
    }
    return this._api
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
