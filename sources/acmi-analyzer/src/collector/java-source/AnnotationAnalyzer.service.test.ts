import { Test, TestingModule } from '@nestjs/testing'

import { ConfigService } from '../../config/Config.service'

import { System } from '../../model/ms'
import { verifyEachContentHasTransformer } from '../../test/verifiers'
import { AnnotationAnalyzer } from './AnnotationAnalyzer.service'

describe(AnnotationAnalyzer.name, () => {
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
      providers: [ConfigService, AnnotationAnalyzer]
    }).compile()
  })

  it('creates an async info flow to a target message exchange', async() => {
    const config = app.get<ConfigService>(ConfigService)
    jest.spyOn(config, 'getSourceFolder').mockImplementation(
      () => process.cwd() + '/src/collector/java-source/testdata/source-folder'
    )

    const inputSystem = new System('test')
    inputSystem.addMicroService('service1')

    const transformer = app.get<AnnotationAnalyzer>(AnnotationAnalyzer)
    const outputSystem = await transformer.transform(inputSystem)

    expect(outputSystem.findMicroService('service1')).toBeDefined()
    expect(outputSystem.findMessageExchange('target-exchange')).toBeDefined()

    verifyEachContentHasTransformer(outputSystem, AnnotationAnalyzer.name)
  })

  it('ignores source of services which are not part of the input system', async() => {
    const config = app.get<ConfigService>(ConfigService)
    jest.spyOn(config, 'getSourceFolder').mockImplementation(
      () => process.cwd() + '/src/collector/java-source/testdata/source-folder'
    )

    const inputSystem = new System('test')

    const transformer = app.get<AnnotationAnalyzer>(AnnotationAnalyzer)
    const outputSystem = await transformer.transform(inputSystem)

    expect(outputSystem.findMicroService('service1')).toBeUndefined()
    expect(outputSystem.findMessageExchange('target-exchange')).toBeUndefined()
  })
})
