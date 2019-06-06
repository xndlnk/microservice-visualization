import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'

import { KubernetesApiService } from '../api/api.service'

import { body as testServicesBody } from '../transformer/testdata/api/services.json'
import { body as testPodsBody } from '../transformer/testdata/api/pods.json'
import { body as testDeploymentsBody } from '../transformer/testdata/api/deployments.json'

import { KubernetesModule } from '../kubernetes.module'
import { KubernetesCollectorService } from './KubernetesCollector.service'
import { System } from '../../model/ms'

describe(KubernetesCollectorService.name, () => {
  let app: INestApplication

  beforeAll(async() => {
    const testingModule = await Test.createTestingModule({
      imports: [KubernetesModule]
    }).compile()
    app = testingModule.createNestApplication()
    await app.init()
  })

  it('collects system using all transformers', async() => {
    const kubernetesApiService = app.get<KubernetesApiService>(KubernetesApiService)
    jest.spyOn(kubernetesApiService, 'getServices').mockImplementation(async() => testServicesBody)
    jest.spyOn(kubernetesApiService, 'getPods').mockImplementation(async() => testPodsBody)
    jest.spyOn(kubernetesApiService, 'getDeployments').mockImplementation(async() => testDeploymentsBody)

    const collector = app.get<KubernetesCollectorService>(KubernetesCollectorService)
    const system = await collector.transform(new System(''))

    expect(system).not.toBeNull()

    // CreateFromKubernetesServices
    expect(system.findMicroService('test-microservice')).toBeDefined()

    // AddKubernetesEnvVars
    expect(system.findMicroService('test-microservice').getPayload().env).toContainEqual({
      name: 'CACHE_SIZE',
      value: '10000'
    })

    // AddKubernetesDeploymentLabels
    expect(system.findMicroService('test-microservice').getPayload().labels.cabinet).toEqual('test-cabinet')
  })
})
