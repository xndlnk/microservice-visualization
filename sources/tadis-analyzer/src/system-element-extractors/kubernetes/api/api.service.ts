import { Injectable, Logger } from '@nestjs/common'
import * as k8s from '@kubernetes/client-node'

@Injectable()
export class KubernetesApiService {
  private coreV1Api: k8s.CoreV1Api
  private appsV1Api: k8s.AppsV1Api

  constructor() {
    const kubeConfig = new k8s.KubeConfig()
    kubeConfig.loadFromDefault()
    this.coreV1Api = kubeConfig.makeApiClient(k8s.CoreV1Api)
    this.appsV1Api = kubeConfig.makeApiClient(k8s.AppsV1Api)
  }

  public async getServices(namespace: string): Promise<k8s.V1ServiceList> {
    try {
      const response = await this.coreV1Api.listNamespacedService(namespace)
      return response.body
    } catch (err) {
      throw new Error('Got invalid response from Kubernetes API: ' + err)
    }
  }

  public async getPods(namespace: string): Promise<k8s.V1PodList> {
    try {
      const response = await this.coreV1Api.listNamespacedPod(namespace)
      return response.body
    } catch (err) {
      throw new Error('Got invalid response from Kubernetes API: ' + err)
    }
  }

  public async getDeployments(namespace: string): Promise<k8s.V1DeploymentList> {
    try {
      const response = await this.appsV1Api.listNamespacedDeployment(namespace)
      return response.body
    } catch (err) {
      throw new Error('Got invalid response from Kubernetes API: ' + err)
    }
  }

}
