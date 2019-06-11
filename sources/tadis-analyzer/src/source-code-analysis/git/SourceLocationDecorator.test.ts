import { Test, TestingModule } from '@nestjs/testing'

import { SourceLocationDecorator } from './SourceLocationDecorator'
import { GitStorageService } from './GitStorage.service'
import { StorageStatus } from './GitStorage'
import { System } from '../../model/ms'
import { ConfigService } from '../../config/Config.service'

describe(SourceLocationDecorator.name, () => {
  let app: TestingModule

  beforeAll(async() => {
    app = await Test.createTestingModule({
      providers: [GitStorageService, ConfigService, SourceLocationDecorator]
    }).compile()
  })

  it('decorates', async() => {
    const inputSystem = new System('test')
    inputSystem.addMicroService('service1')
    inputSystem.addMicroService('service2')

    const testStorageStatus: StorageStatus[] = [
      {
        name: 'service1',
        location: '/source/service1',
        lastModified: new Date()
      }
    ]
    const gitStorage = app.get<GitStorageService>(GitStorageService)
    const gitStorageSpy = jest.spyOn(gitStorage, 'getStorageStatus')
    gitStorageSpy.mockImplementation(async() => testStorageStatus)

    const decorator = app.get<SourceLocationDecorator>(SourceLocationDecorator)
    const system = await decorator.transform(inputSystem)

    expect(system.findMicroService('service1').getPayload().sourceLocation).toEqual('/source/service1')
    expect(system.findMicroService('service2').getPayload().sourceLocation).toEqual('')
  })
})
