import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'

import { SubSystemFromPayloadTransformer } from './SubSystemFromPayloadTransformer'
import { System } from '../model/ms'
import { CommonTransformersModule } from './CommonTransformers.module'

jest.mock('../config/Config.service')

describe(CommonTransformersModule.name, () => {
  let app: INestApplication

  beforeAll(async() => {
    const testingModule = await Test.createTestingModule({
      imports: [CommonTransformersModule]
    }).compile()
    app = testingModule.createNestApplication()
    await app.init()
  })

  it('integrates', async() => {
    const inputSystem = new System('system')

    const transformer = app.get<SubSystemFromPayloadTransformer>(SubSystemFromPayloadTransformer)
    const system = await transformer.transform(inputSystem,
      SubSystemFromPayloadTransformer.getSubSystemNameFromCabinetLabel)

    expect(system.nodes).toHaveLength(0)
  })
})
