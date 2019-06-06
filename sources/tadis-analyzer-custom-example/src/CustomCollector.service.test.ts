import { Test } from '@nestjs/testing'
import { INestApplication, Type } from '@nestjs/common'

import {
  System, KubernetesCollectorService, RabbitMqCollectorService, FeignClientsFromSourceCodeProducer,
  SourceLocationDecorator, CabinetTransformer, ExcludedNodesRemover, GitStorageService, AnnotationAnalyzer
} from 'tadis-analyzer'

import { CustomCollectorService } from './CustomCollector.service'
import { CustomCollectorModule } from './CustomCollector.module'

describe(CustomCollectorService.name, () => {
  let app: INestApplication

  beforeAll(async() => {
    const testingModule = await Test.createTestingModule({
      imports: [CustomCollectorModule],
      providers: [CustomCollectorService]
    }).compile()
    app = testingModule.createNestApplication()
    await app.init()
  })

  it('collects system', async() => {

    const spyOnKubernetesCollector = getSpyOnMethodTransform<KubernetesCollectorService>(KubernetesCollectorService, app)
    const spyOnRabbitMqCollector = getSpyOnMethodTransform<RabbitMqCollectorService>(RabbitMqCollectorService, app)
    const spyOnFeignProducer = getSpyOnMethodTransform<FeignClientsFromSourceCodeProducer>(FeignClientsFromSourceCodeProducer, app)
    const spyOnExcludedNodesRemover = getSpyOnMethodTransform<ExcludedNodesRemover>(ExcludedNodesRemover, app)
    const spyOnCabinetLabelsTransformer = getSpyOnMethodTransform<CabinetTransformer>(CabinetTransformer, app)
    const sourceLocationDecoratorSpy = getSpyOnMethodTransform<SourceLocationDecorator>(SourceLocationDecorator, app)
    const annotationAnalyzerSpy = getSpyOnMethodTransform<AnnotationAnalyzer>(AnnotationAnalyzer, app)

    const gitStorage = app.get<GitStorageService>(GitStorageService)
    const gitStorageSpy = jest.spyOn(gitStorage, 'getStorageStatus')
    gitStorageSpy.mockImplementation(async() => ([]))

    const customCollector = app.get<CustomCollectorService>(CustomCollectorService)
    const system = await customCollector.getSystem()

    expect(system).not.toBeNull()

    // expect(spyOnKubernetesCollector).toHaveBeenCalled()
    // expect(spyOnRabbitMqCollector).toHaveBeenCalled()

    expect(spyOnFeignProducer).toHaveBeenCalled()

    expect(spyOnExcludedNodesRemover).toHaveBeenCalled()
    expect(spyOnCabinetLabelsTransformer).toHaveBeenCalled()

    expect(sourceLocationDecoratorSpy).toHaveBeenCalled()
    expect(annotationAnalyzerSpy).toHaveBeenCalled()
  })
})

interface Transformable {
  transform(system: System, ...other): Promise<System>
}

function getSpyOnMethodTransform<T extends Transformable>(type: Type<T>, app: INestApplication): any {
  const service: Transformable = app.get<T>(type)
  const spy = jest.spyOn(service, 'transform')
  spy.mockImplementation(async(system, ...other) => system)
  return spy
}
