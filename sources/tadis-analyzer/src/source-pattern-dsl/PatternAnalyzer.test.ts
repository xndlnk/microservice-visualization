import { Test, TestingModule } from '@nestjs/testing'

import { ConfigService } from '../config/Config.service'

import { System, AsyncEventFlow } from '../model/ms'
import { verifyEachContentHasTransformer } from '../test/verifiers'
import {
  PatternAnalyzer, ElementMapping, SystemPattern, NodePattern, EdgePattern,
  SearchTextLocation
} from './PatternAnalyzer'

describe(PatternAnalyzer.name, () => {
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
      providers: [ConfigService, PatternAnalyzer]
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

  const sourcePathRoot = __dirname + '/testdata/source-folder'

  it('creates a service from a file path', async() => {
    const inputSystem = new System('test')

    const systemPattern: SystemPattern = {
      servicePatterns: [
        {
          searchTextLocation: SearchTextLocation.FILE_PATH,
          regExp: sourcePathRoot + '/([^/]+)/source\.java',
          capturingGroupIndexForNodeName: 1,
          nodeType: 'MicroService'
        }
      ],
      edgePatterns: []
    }

    const transformer = app.get<PatternAnalyzer>(PatternAnalyzer)
    const outputSystem = await transformer.transformByPattern(inputSystem, systemPattern)

    expect(outputSystem.findMicroService('service1')).toBeDefined()
  })

  it('creates an async info flow for multiple annotations in the same file NEW', async() => {

    const inputSystem = new System('test')

    const ws = '\\s*'
    const id = '\\w+'
    const anything = '[^]*'

    const systemPattern: SystemPattern = {
      servicePatterns: [],
      edgePatterns: [
        {
          edgeType: 'SyncDataFlow',
          sourceNodePattern: {
            searchTextLocation: SearchTextLocation.FILE_PATH,
            regExp: sourcePathRoot + '/([^/]+)/source\.java',
            capturingGroupIndexForNodeName: 1,
            nodeType: 'MicroService'
          },
          targetNodePattern: {
            searchTextLocation: SearchTextLocation.FILE_CONTENT,
            regExp: `@EventProcessor${ws}\\(${anything}sendToExchange${ws}=${ws}(${id})`,
            capturingGroupIndexForNodeName: 1,
            nameResolution: {
              searchTextLocation: SearchTextLocation.FILE_CONTENT,
              regExp: `$name${ws}=${ws}"([^"]*)"`
            },
            nodeType: 'MessageExchange'
          }
        },
        {
          edgeType: 'SyncDataFlow',
          sourceNodePattern: {
            searchTextLocation: SearchTextLocation.FILE_PATH,
            regExp: sourcePathRoot + '/([^/]+)/source\.java',
            capturingGroupIndexForNodeName: 1,
            nodeType: 'MicroService'
          },
          targetNodePattern: {
            searchTextLocation: SearchTextLocation.FILE_CONTENT,
            regExp: `@EventProcessor${ws}\\(${anything}sendToExchange${ws}=${ws}"([^"]+)"`,
            capturingGroupIndexForNodeName: 1,
            nodeType: 'MessageExchange'
          }
        }
      ]
    }

    const transformer = app.get<PatternAnalyzer>(PatternAnalyzer)
    const outputSystem = await transformer.transformByPattern(inputSystem, systemPattern)

    expect(outputSystem.findMicroService('service1')).toBeDefined()
    expect(outputSystem.findMessageExchange('target-exchange-X')).toBeDefined()
    expect(outputSystem.findMessageExchange('target-exchange-Y')).toBeDefined()
  })

  // TODO: rewrite all tests below!!
  it('creates an async info flow for multiple annotations in the same file', async() => {

    const inputSystem = new System('test')
    inputSystem.addMicroService('service1')

    const transformer = app.get<PatternAnalyzer>(PatternAnalyzer)
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

    verifyEachContentHasTransformer(outputSystem, PatternAnalyzer.name)
  })

  it('re-uses exchanges when they already exist', async() => {

    const inputSystem = new System('test')
    inputSystem.addMicroService('service1')
    inputSystem.addMessageExchange('source-exchange-X')

    const transformer = app.get<PatternAnalyzer>(PatternAnalyzer)
    const outputSystem = await transformer.transform(inputSystem, 'EventProcessor', elementMappings)

    expect(outputSystem.findMicroService('service1')).toBeDefined()
    expect(outputSystem.nodes.filter(node => node.getName() === 'source-exchange-X')).toHaveLength(1)

    verifyEachContentHasTransformer(outputSystem, PatternAnalyzer.name)
  })

  it('ignores source of services which are not part of the input system', async() => {

    const inputSystem = new System('test')

    const transformer = app.get<PatternAnalyzer>(PatternAnalyzer)
    const outputSystem = await transformer.transform(inputSystem, 'EventProcessor', elementMappings)

    expect(outputSystem.findMicroService('service1')).toBeUndefined()
    expect(outputSystem.findMessageExchange('target-exchange')).toBeUndefined()
  })

  it('can create nodes from multiple elements in the same annotation', async() => {

    const inputSystem = new System('test')
    inputSystem.addMicroService('service1')

    const transformer = app.get<PatternAnalyzer>(PatternAnalyzer)
    const outputSystem = await transformer.transform(inputSystem, 'EventProcessor', elementMappings)

    expect(outputSystem.findMicroService('service1')).toBeDefined()
    expect(outputSystem.findMessageExchange('source-exchange-X')).toBeDefined()
    expect(outputSystem.findMessageExchange('target-exchange-X')).toBeDefined()

    expect(outputSystem.edges.find(edge => edge.source.getName() === 'service1'
      && edge.target.getName() === 'target-exchange-X')).toBeDefined()

    expect(outputSystem.edges.find(edge => edge.source.getName() === 'source-exchange-X'
      && edge.target.getName() === 'service1')).toBeDefined()

    verifyEachContentHasTransformer(outputSystem, PatternAnalyzer.name)
  })
})
