import { Test, TestingModule } from '@nestjs/testing'

import { ConfigService } from '../../config/config.service'

import { System } from '../../model/ms'
import { FeignClientsFromSourceCodeProducer } from './FeignClientsFromSourceCodeProducer'
import { verifyEachContentHasTransformer } from '../../test/verifiers'

describe(FeignClientsFromSourceCodeProducer.name, () => {
  let app: TestingModule
  let originalEnv: NodeJS.ProcessEnv = null

  beforeEach(() => {
    originalEnv = process.env
  })

  afterEach(() => {
    process.env = originalEnv
  })

  beforeAll(async() => {
    app = await Test.createTestingModule({
      controllers: [],
      providers: [ConfigService, FeignClientsFromSourceCodeProducer]
    }).compile()
  })

  it('transforms', async() => {
    const config = app.get<ConfigService>(ConfigService)
    jest.spyOn(config, 'getSourceFolder').mockImplementation(
      // TODO: move test data to feign folder
      () => process.cwd() + '/src/collector/feign/testdata/source-folder'
    )

    const inputSystem = new System('test')

    const addFeignClientsStep = app.get<FeignClientsFromSourceCodeProducer>(FeignClientsFromSourceCodeProducer)
    const outputSystem = await addFeignClientsStep.transform(inputSystem)

    expect(outputSystem).not.toBeNull()

    expect(outputSystem.getMicroServices()).toHaveLength(3)
    const msNames = outputSystem.getMicroServices().map(ms => ms.getPayload().name)
    expect(msNames).toContainEqual('service-with-feign-clients')
    expect(msNames).toContainEqual('target-service1')
    expect(msNames).toContainEqual('target-service2')

    expect(outputSystem.getSyncDataFlows()).toHaveLength(2)
    expect(outputSystem.getSyncDataFlows()[0].source.id).toEqual(outputSystem.findMicroService('target-service1').id)
    expect(outputSystem.getSyncDataFlows()[0].target.id).toEqual(outputSystem.findMicroService('service-with-feign-clients').id)
    expect(outputSystem.getSyncDataFlows()[0].getPayload().definedEndpoints)
      .toEqual([
        { path: '/rest/path/1' },
        { path: '/rest/path/2' }
      ])

    verifyEachContentHasTransformer(outputSystem, FeignClientsFromSourceCodeProducer.name)
  })

  it('ignores source found in current project when not run in test mode', async() => {
    const config = app.get<ConfigService>(ConfigService)
    jest.spyOn(config, 'getSourceFolder').mockImplementation(
      () => process.cwd() + '/src/collector/feign/testdata/source-folder'
    )

    process.env.NODE_ENV = 'non-test'

    const inputSystem = new System('test')

    const addFeignClientsStep = app.get<FeignClientsFromSourceCodeProducer>(FeignClientsFromSourceCodeProducer)
    const outputSystem = await addFeignClientsStep.transform(inputSystem)

    expect(outputSystem).not.toBeNull()

    expect(outputSystem.getMicroServices()).toHaveLength(0)
  })
})
