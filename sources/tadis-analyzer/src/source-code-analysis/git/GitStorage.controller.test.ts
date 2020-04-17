import { Test, TestingModule } from '@nestjs/testing'
import { GitStorageController } from './GitStorage.controller'
import { GitStorageService } from './GitStorage.service'
import { ConfigService } from '../../config/Config.service'

describe('SourceStorageController', () => {
  let app: TestingModule

  beforeAll(async() => {
    const configService = new ConfigService()
    jest.spyOn(configService, 'getSourceFolder').mockImplementation(
      () => process.cwd() + '/src/source-code-analysis/git/testdata/source-folder'
    )

    app = await Test.createTestingModule({
      controllers: [GitStorageController],
      providers: [GitStorageService, ConfigService]
    })
      .overrideProvider(ConfigService)
      .useValue(configService)
      .compile()
  })

  describe('getStorageStatus', () => {
    it('returns something', async() => {
      const controller = app.get<GitStorageController>(GitStorageController)
      const status = await controller.getStorageStatus()
      expect(status).not.toBeNull()
    })
  })
})
