import { Test } from '@nestjs/testing'
import { INestApplication, Type } from '@nestjs/common'

import { CollectorService } from './Collector.service'
import { CollectorModule } from './collector.module'

import { ExcludedNodesRemover } from './generic-transformer/ExcludedNodesRemover'
import { SubSystemTransformerService } from './generic-transformer/SubSystemTransformer'
import { FeignClientsFromSourceCodeProducer } from './feign/FeignClientsFromSourceCodeProducer'

import { KubernetesModule } from '../kubernetes/kubernetes.module'
import { KubernetesCollectorService } from '../kubernetes/collector/KubernetesCollector.service'

import { RabbitMqModule } from '../rabbitmq/rabbitmq.module'
import { RabbitMqCollectorService } from '../rabbitmq/collector/RabbitMqCollector.service'
import { System } from 'src/model/ms'
import { SourceLocationDecorator } from '../source-code-analysis/git/SourceLocationDecorator.service'

describe(CollectorService.name, () => {
  let app: INestApplication

  beforeAll(async() => {
    const testingModule = await Test.createTestingModule({
      imports: [CollectorModule, KubernetesModule, RabbitMqModule]
    }).compile()
    app = testingModule.createNestApplication()
    await app.init()
  })

  it('collects system using all transformers', async() => {
    // TODO: this test will get bigger and more complex because of the dependency
    // to test data from all the transformers. therefore, remove dependency to
    // all test data and just verify that each transformer is called, no matter
    // what if returns.

    const kubernetesCollector = app.get<KubernetesCollectorService>(KubernetesCollectorService)
    const spyOnKubernetesCollector = jest.spyOn(kubernetesCollector, 'transform')
    spyOnKubernetesCollector.mockImplementation(async(system) => system)

    const rabbitMqCollector = app.get<RabbitMqCollectorService>(RabbitMqCollectorService)
    const spyOnRabbitMqCollector = jest.spyOn(rabbitMqCollector, 'transform')
    spyOnRabbitMqCollector.mockImplementation(async(system) => system)

    const feignProducer = app.get<FeignClientsFromSourceCodeProducer>(FeignClientsFromSourceCodeProducer)
    const spyOnFeignProducer = jest.spyOn(feignProducer, 'transform')
    spyOnFeignProducer.mockImplementation(async(system) => system)

    const excludedNodesRemover = app.get<ExcludedNodesRemover>(ExcludedNodesRemover)
    const spyOnExcludedNodesRemover = jest.spyOn(excludedNodesRemover, 'transform')
    spyOnExcludedNodesRemover.mockImplementation(async(system) => system)

    const cabinetTransformer = app.get<SubSystemTransformerService>(SubSystemTransformerService)
    const spyOnCabinetLabelsTransformer = jest.spyOn(cabinetTransformer, 'transform')
    spyOnCabinetLabelsTransformer.mockImplementation(async(system) => system)

    const sourceLocationDecoratorSpy = getSpyOnMethodTransform<SourceLocationDecorator>(SourceLocationDecorator, app)

    const orchestrator = app.get<CollectorService>(CollectorService)
    const system = await orchestrator.getSystem()

    expect(system).not.toBeNull()

    expect(spyOnKubernetesCollector).toHaveBeenCalled()
    expect(spyOnRabbitMqCollector).toHaveBeenCalled()

    expect(spyOnFeignProducer).toHaveBeenCalled()

    expect(spyOnExcludedNodesRemover).toHaveBeenCalled()
    expect(spyOnCabinetLabelsTransformer).toHaveBeenCalled()

    expect(sourceLocationDecoratorSpy).toHaveBeenCalled()
  })
})

interface Transformable {
  transform(system: System): Promise<System>
}

function getSpyOnMethodTransform<T extends Transformable>(type: Type<T>, app: INestApplication): any {
  const service: Transformable = app.get<T>(type)
  const spy = jest.spyOn(service, 'transform')
  spy.mockImplementation(async(system) => system)
  return spy
}
