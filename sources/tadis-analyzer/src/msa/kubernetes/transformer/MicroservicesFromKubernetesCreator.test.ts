import { Test, TestingModule } from '@nestjs/testing'

import { KubernetesApiService } from '../api/api.service'
import { ConfigService } from '../../../config/Config.service'
import { MicroservicesFromKubernetesCreator } from './MicroservicesFromKubernetesCreator'

import { body as testBodyServices } from './testdata/api/services.json'
import { body as testBodyPods } from './testdata/api/pods.json'
import { verifyEachContentHasTransformer } from '../../../test/verifiers'
import { System } from '../../../model/ms'

describe(MicroservicesFromKubernetesCreator.name, () => {
  let app: TestingModule

  beforeAll(async() => {
    app = await Test.createTestingModule({
      controllers: [],
      providers: [
        ConfigService,
        KubernetesApiService,
        MicroservicesFromKubernetesCreator
      ]
    }).compile()
  })

  it('transforms', async() => {
    const configService = app.get<ConfigService>(ConfigService)
    jest.spyOn(configService, 'getKubernetesNamespace').mockImplementation(() => 'test-ns')

    const apiService = app.get<KubernetesApiService>(KubernetesApiService)
    jest.spyOn(apiService, 'getPods').mockImplementation(async() => testBodyPods)
    jest.spyOn(apiService, 'getServices').mockImplementation(async() => testBodyServices)

    const kubernetesService = app.get<MicroservicesFromKubernetesCreator>(MicroservicesFromKubernetesCreator)

    const system = await kubernetesService.transform(new System(''))

    expect(system).not.toBeNull()
    expect(system.getPayload().name).toEqual('test-ns')
    expect(system.nodes).toHaveLength(1)
    expect(system.nodes[0].content.payload.name).toEqual('test-microservice')

    verifyEachContentHasTransformer(system, MicroservicesFromKubernetesCreator.name)
  })
})
