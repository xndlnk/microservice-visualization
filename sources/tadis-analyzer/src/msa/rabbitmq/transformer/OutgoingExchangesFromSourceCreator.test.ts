import { Test, TestingModule } from '@nestjs/testing'

import { ConfigService } from '../../../config/Config.service'

import { System } from '../../../model/ms'
import { OutgoingExchangesFromSourceCreator } from './OutgoingExchangesFromSourceCreator'
import { verifyEachContentHasTransformer } from '../../../test/verifiers'

describe(OutgoingExchangesFromSourceCreator.name, () => {
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
      providers: [ConfigService, OutgoingExchangesFromSourceCreator]
    }).compile()

    const config = app.get<ConfigService>(ConfigService)
    jest.spyOn(config, 'getSourceFolder').mockImplementation(
      () => __dirname + '/testdata/source-folder'
    )
  })

  it('transforms', async() => {
    const inputSystem = new System('test')

    const addExchangesFormSourceStep = app.get<OutgoingExchangesFromSourceCreator>(OutgoingExchangesFromSourceCreator)
    const outputSystem = await addExchangesFormSourceStep.transform(inputSystem)

    expect(outputSystem).not.toBeNull()

    expect(outputSystem.getMicroServices()).toHaveLength(1)
    expect(outputSystem.getMessageExchanges()).toHaveLength(2)
    const exchangeNames = outputSystem.getMessageExchanges().map(exchange => exchange.getPayload().name)
    expect(exchangeNames).toContainEqual('exchangeInSource1')
    expect(exchangeNames).toContainEqual('exchangeInSource2')

    verifyEachContentHasTransformer(outputSystem, OutgoingExchangesFromSourceCreator.name)
  })

  it('ignores source found in current project when not run in test mode', async() => {
    process.env.NODE_ENV = 'non-test'

    const inputSystem = new System('test')

    const addExchangesFormSourceStep = app.get<OutgoingExchangesFromSourceCreator>(OutgoingExchangesFromSourceCreator)
    const outputSystem = await addExchangesFormSourceStep.transform(inputSystem)

    expect(outputSystem).not.toBeNull()

    expect(outputSystem.getMicroServices()).toHaveLength(0)
    expect(outputSystem.getMessageExchanges()).toHaveLength(0)
  })
})
