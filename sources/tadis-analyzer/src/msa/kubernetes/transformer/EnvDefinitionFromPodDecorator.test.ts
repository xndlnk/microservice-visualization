import { Test, TestingModule } from '@nestjs/testing'

import { KubernetesApiService } from '../api/api.service'
import { ConfigService } from '../../../config/Config.service'
import { EnvDefinitionFromPodDecorator } from './EnvDefinitionFromPodDecorator'

import { body as testBody } from './testdata/api/pods.json'
import { System } from '../../../model/ms'

describe(EnvDefinitionFromPodDecorator.name, () => {
  let app: TestingModule

  beforeAll(async() => {
    app = await Test.createTestingModule({
      controllers: [],
      providers: [ConfigService, KubernetesApiService, EnvDefinitionFromPodDecorator]
    }).compile()
  })

  it('transforms', async() => {
    const apiService = app.get<KubernetesApiService>(KubernetesApiService)
    jest.spyOn(apiService, 'getPods').mockImplementation(async() => testBody)

    const inputSystem = new System('test')
    inputSystem.addMicroService('test-microservice', { p: 1 })

    const envService = app.get<EnvDefinitionFromPodDecorator>(EnvDefinitionFromPodDecorator)
    const outputSystem = await envService.transform(inputSystem)

    expect(outputSystem).not.toBeNull()
    expect(outputSystem.nodes).toHaveLength(1)
    expect(outputSystem.nodes[0].content.payload.env).toContainEqual({
      name: 'CACHE_SIZE',
      value: '10000'
    })
  })
})
