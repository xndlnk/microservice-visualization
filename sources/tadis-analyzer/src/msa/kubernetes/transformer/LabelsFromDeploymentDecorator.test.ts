import { Test, TestingModule } from '@nestjs/testing'

import { KubernetesApiService } from '../api/api.service'
import { ConfigService } from '../../../config/Config.service'

import { body as testBody } from './testdata/api/deployments.json'
import { System } from '../../../model/ms'
import { LabelsFromDeploymentDecorator } from './LabelsFromDeploymentDecorator'

describe(LabelsFromDeploymentDecorator.name, () => {
  let app: TestingModule

  beforeAll(async() => {
    app = await Test.createTestingModule({
      controllers: [],
      providers: [ConfigService, KubernetesApiService, LabelsFromDeploymentDecorator]
    }).compile()
  })

  it('transforms', async() => {
    const apiService = app.get<KubernetesApiService>(KubernetesApiService)
    jest.spyOn(apiService, 'getDeployments').mockImplementation(async() => testBody)

    const inputSystem = new System('test')
    inputSystem.addMicroService('test-microservice', { p: 1 })

    const addLabels = app.get<LabelsFromDeploymentDecorator>(LabelsFromDeploymentDecorator)
    const outputSystem = await addLabels.transform(inputSystem)

    expect(outputSystem).not.toBeNull()
    expect(outputSystem.nodes).toHaveLength(1)
    expect(outputSystem.nodes[0].content.payload.labels).toBeDefined()
    expect(outputSystem.nodes[0].content.payload.labels.cabinet).toEqual('test-cabinet')
  })
})
