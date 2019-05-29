import { Test, TestingModule } from '@nestjs/testing'

import { ConfigService } from '../../config/Config.service'

import { System, AsyncEventFlow } from '../../model/ms'
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

  it('creates an async info flow for multiple annotations in the same file', async() => {
    const config = app.get<ConfigService>(ConfigService)
    jest.spyOn(config, 'getSourceFolder').mockImplementation(
      () => process.cwd() + '/src/collector/java-source/testdata/source-folder'
    )

    const inputSystem = new System('test')
    inputSystem.addMicroService('service1')

    const transformer = app.get<AnnotationAnalyzer>(AnnotationAnalyzer)
    const outputSystem = await transformer.transform(inputSystem)

    expect(outputSystem.findMicroService('service1')).toBeDefined()
    expect(outputSystem.findMessageExchange('target-exchange-X')).toBeDefined()
    expect(outputSystem.findMessageExchange('target-exchange-Y')).toBeDefined()

    // TODO: are there better ways to test parts of objects to match in jest?
    expect(outputSystem.edges.find(edge => edge.source.getName() === 'service1'
      && edge.target.getName() === 'target-exchange-X'
      && edge.content.type === AsyncEventFlow.name)).toBeDefined()

    expect(outputSystem.edges.find(edge => edge.source.getName() === 'service1'
      && edge.target.getName() === 'target-exchange-Y')).toBeDefined()

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

  it('can create nodes from multiple elements in the same annotation', async() => {
    const config = app.get<ConfigService>(ConfigService)
    jest.spyOn(config, 'getSourceFolder').mockImplementation(
      () => process.cwd() + '/src/collector/java-source/testdata/source-folder'
    )

    const inputSystem = new System('test')
    inputSystem.addMicroService('service1')

    const transformer = app.get<AnnotationAnalyzer>(AnnotationAnalyzer)
    const outputSystem = await transformer.transform(inputSystem)

    expect(outputSystem.findMicroService('service1')).toBeDefined()
    expect(outputSystem.findMessageExchange('source-exchange-X')).toBeDefined()
    expect(outputSystem.findMessageExchange('target-exchange-X')).toBeDefined()

    expect(outputSystem.edges.find(edge => edge.source.getName() === 'service1'
      && edge.target.getName() === 'target-exchange-X')).toBeDefined()

    expect(outputSystem.edges.find(edge => edge.source.getName() === 'source-exchange-X'
      && edge.target.getName() === 'service1')).toBeDefined()

    verifyEachContentHasTransformer(outputSystem, AnnotationAnalyzer.name)
  })
})
