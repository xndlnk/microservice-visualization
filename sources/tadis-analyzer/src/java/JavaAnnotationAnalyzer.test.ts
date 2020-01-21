import { Test, TestingModule } from '@nestjs/testing'

import { ConfigService } from '../config/Config.service'

import { System, AsyncEventFlow } from '../model/ms'
import { verifyEachContentHasTransformer } from '../test/verifiers'
import { JavaAnnotationAnalyzer, ElementMapping } from './JavaAnnotationAnalyzer'

describe(JavaAnnotationAnalyzer.name, () => {
  let app: TestingModule

  beforeEach(() => {
    process.env.NODE_ENV = 'test'
  })

  beforeAll(async() => {
    app = await Test.createTestingModule({
      controllers: [],
      providers: [ConfigService, JavaAnnotationAnalyzer]
    }).compile()

    const config = app.get<ConfigService>(ConfigService)
    jest.spyOn(config, 'getSourceFolder').mockImplementation(
      () => __dirname + '/testdata/source-folder'
    )
  })

  const elementMappings: ElementMapping[] = [
    {
      elementToDeriveNodeFrom: 'sendToExchange',
      nodeTypeToCreate: 'MessageExchange',
      nodeTypeDirection: 'target',
      edgeType: 'AsyncEventFlow'
    },
    {
      elementToDeriveNodeFrom: 'receiveFromExchange',
      nodeTypeToCreate: 'MessageExchange',
      nodeTypeDirection: 'source',
      edgeType: 'AsyncEventFlow'
    }
  ]

  it('creates an async info flow for multiple annotations in the same file', async() => {

    const inputSystem = new System('test')
    inputSystem.addMicroService('service1')

    const transformer = app.get<JavaAnnotationAnalyzer>(JavaAnnotationAnalyzer)
    const outputSystem = await transformer.transform(inputSystem, 'EventProcessor', elementMappings)

    expect(outputSystem.findMicroService('service1')).toBeDefined()
    expect(outputSystem.findMessageExchange('target-exchange-X')).toBeDefined()
    expect(outputSystem.findMessageExchange('target-exchange-Y')).toBeDefined()

    // TODO: are there better ways to test parts of objects to match in jest?
    expect(outputSystem.edges.find(edge => edge.source.getName() === 'service1'
      && edge.target.getName() === 'target-exchange-X'
      && edge.content.type === AsyncEventFlow.name)).toBeDefined()

    expect(outputSystem.edges.find(edge => edge.source.getName() === 'service1'
      && edge.target.getName() === 'target-exchange-Y')).toBeDefined()

    verifyEachContentHasTransformer(outputSystem, JavaAnnotationAnalyzer.name)
  })

  it('re-uses exchanges when they already exist', async() => {

    const inputSystem = new System('test')
    inputSystem.addMicroService('service1')
    inputSystem.addMessageExchange('source-exchange-X')

    const transformer = app.get<JavaAnnotationAnalyzer>(JavaAnnotationAnalyzer)
    const outputSystem = await transformer.transform(inputSystem, 'EventProcessor', elementMappings)

    expect(outputSystem.findMicroService('service1')).toBeDefined()
    expect(outputSystem.nodes.filter(node => node.getName() === 'source-exchange-X')).toHaveLength(1)

    verifyEachContentHasTransformer(outputSystem, JavaAnnotationAnalyzer.name)
  })

  it('ignores source of services which are not part of the input system', async() => {

    const inputSystem = new System('test')

    const transformer = app.get<JavaAnnotationAnalyzer>(JavaAnnotationAnalyzer)
    const outputSystem = await transformer.transform(inputSystem, 'EventProcessor', elementMappings)

    expect(outputSystem.findMicroService('service1')).toBeUndefined()
    expect(outputSystem.findMessageExchange('target-exchange')).toBeUndefined()
  })

  it('can create nodes from multiple elements in the same annotation', async() => {

    const inputSystem = new System('test')
    inputSystem.addMicroService('service1')

    const transformer = app.get<JavaAnnotationAnalyzer>(JavaAnnotationAnalyzer)
    const outputSystem = await transformer.transform(inputSystem, 'EventProcessor', elementMappings)

    expect(outputSystem.findMicroService('service1')).toBeDefined()
    expect(outputSystem.findMessageExchange('source-exchange-X')).toBeDefined()
    expect(outputSystem.findMessageExchange('target-exchange-X')).toBeDefined()

    expect(outputSystem.edges.find(edge => edge.source.getName() === 'service1'
      && edge.target.getName() === 'target-exchange-X')).toBeDefined()

    expect(outputSystem.edges.find(edge => edge.source.getName() === 'source-exchange-X'
      && edge.target.getName() === 'service1')).toBeDefined()

    verifyEachContentHasTransformer(outputSystem, JavaAnnotationAnalyzer.name)
  })
})
