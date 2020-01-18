import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService, System, patternAnalyzer } from 'tadis-analyzer'

import { AnalyzerForEventProcessor } from './AnalyzerForEventProcessor'

describe(AnalyzerForEventProcessor.name, () => {
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
      providers: [
        ConfigService,
        AnalyzerForEventProcessor,
        patternAnalyzer.PatternAnalyzer
      ]
    }).compile()

    const config = app.get<ConfigService>(ConfigService)
    jest.spyOn(config, 'getSourceFolder').mockImplementation(
      () => __dirname + '/../../example-source-code'
    )
  })

  it('creates service1 --> target-exchange-x', async() => {
    const analyzer = app.get<AnalyzerForEventProcessor>(AnalyzerForEventProcessor)
    const outputSystem = await analyzer.transform(new System(''))

    expect(outputSystem.findMicroService('service1')).toBeDefined()
    expect(outputSystem.findMessageExchange('target-exchange-X')).toBeDefined()
    expect(outputSystem.getAsyncEventFlows()
      .find(flow => flow.source.getName() === 'service1'
        && flow.target.getName() === 'target-exchange-X')).toBeDefined()
  })

})
