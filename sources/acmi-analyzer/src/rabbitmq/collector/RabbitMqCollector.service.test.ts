import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'

import { ConfigService } from '../../config/config.service'
import { RabbitMqManagementApiService } from '../api/api.service'

import * as testQueues from '../transformer/testdata/api/queues.json'
import * as testBindings from '../transformer/testdata/api/bindings.json'
import { RabbitMqCollectorService } from './RabbitMqCollector.service'
import { RabbitMqModule } from '../rabbitmq.module'
import { System } from '../../model/ms'

describe(RabbitMqCollectorService.name, () => {
  let app: INestApplication

  beforeAll(async() => {
    const testingModule = await Test.createTestingModule({
      imports: [RabbitMqModule]
    }).compile()
    app = testingModule.createNestApplication()
    await app.init()
  })

  it('collects system using all transformers', async() => {
    const config = app.get<ConfigService>(ConfigService)
    jest.spyOn(config, 'getSourceFolder').mockImplementation(
      () => process.cwd() + '/src/rabbitmq/transformer/testdata/source-folder'
    )

    const rabbitMqApiService = app.get<RabbitMqManagementApiService>(RabbitMqManagementApiService)
    jest.spyOn(rabbitMqApiService, 'getQueues').mockImplementation(async() => testQueues)
    jest.spyOn(rabbitMqApiService, 'getBindings').mockImplementation(async() => testBindings)

    const inputSystem = new System('')
    const service = inputSystem.addMicroService('test-microservice', { p: 1 })
    service.getPayload().env = [
      {
        'name': 'OUTGOING_EXCHANGE',
        'value': 'test-outgoing-exchange'
      }
    ]

    const collector = app.get<RabbitMqCollectorService>(RabbitMqCollectorService)
    const system = await collector.transform(inputSystem)

    expect(system).not.toBeNull()

    // AddExchangesFromEnvVars
    expect(system.findMessageExchange('test-outgoing-exchange')).toBeDefined()

    // AddExchangesFromSource
    expect(system.findMessageExchange('exchangeInSource1')).toBeDefined()

    // AddExchangesFromRabbitMqApi
    expect(system.findMicroService('receiver-service')).toBeDefined()
  })
})
