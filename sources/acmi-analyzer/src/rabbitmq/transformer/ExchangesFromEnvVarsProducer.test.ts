import { Test, TestingModule } from '@nestjs/testing'

import '../../test/expect-extensions'
import { verifyEachContentHasTransformer } from '../../test/verifiers'

import { ConfigService } from '../../config/Config.service'
import { ExchangesFromEnvVarsProducer } from './ExchangesFromEnvVarsProducer'

import { System } from '../../model/ms'

describe(ExchangesFromEnvVarsProducer.name, () => {
  let app: TestingModule

  beforeAll(async() => {
    app = await Test.createTestingModule({
      controllers: [],
      providers: [
        ConfigService, ExchangesFromEnvVarsProducer
      ]
    }).compile()
  })

  it('transforms', async() => {
    const inputSystem = new System('test')
    const service = inputSystem.addMicroService('test-microservice', { p: 1 })
    service.getPayload().env = [
      {
        'name': 'OUTGOING_EXCHANGE',
        'value': 'test-outgoing-exchange'
      },
      {
        'name': 'OUTGOING_ROUTING_KEY',
        'value': 'test.outgoing.publish.update'
      },
      {
        'name': 'EXCHANGE_INCOMING',
        'value': 'test-incoming-exchange'
      },
      {
        'name': 'ROUTING_KEY_INCOMING',
        'value': 'test.incoming.publish.update'
      }
    ]

    const envExchangesService = app.get<ExchangesFromEnvVarsProducer>(ExchangesFromEnvVarsProducer)
    const outputSystem = await envExchangesService.transform(inputSystem)

    expect(outputSystem).not.toBeNull()
    expect(outputSystem.nodes).toHaveLength(3)
    expect(outputSystem.getMicroServices()).toHaveLength(1)
    expect(outputSystem.getMessageExchanges()).toHaveLength(2)
    expect(outputSystem.findMessageExchange('test-outgoing-exchange')).toBeDefined()
    expect(outputSystem.findMessageExchange('test-incoming-exchange').content.transformerName).toEqual(ExchangesFromEnvVarsProducer.name)

    verifyEachContentHasTransformer(outputSystem, ExchangesFromEnvVarsProducer.name)

    expect(outputSystem.edges).toHaveLength(2)
    expect(outputSystem.edges.filter(edge => edge.content.type !== undefined)).toHaveLength(2)

    expect(outputSystem.edges[0].source.id).toEqual(outputSystem.findMicroService('test-microservice').id)
    expect(outputSystem.edges[0].target.id).toEqual(outputSystem.findMessageExchange('test-outgoing-exchange').id)

    expect(outputSystem.edges[1].source.id).toEqual(outputSystem.findMessageExchange('test-incoming-exchange').id)
    expect(outputSystem.edges[1].target.id).toEqual(outputSystem.findMicroService('test-microservice').id)
  })
})
