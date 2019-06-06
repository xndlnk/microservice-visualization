import { Injectable } from '@nestjs/common'

import {
  System, MicroService, Metadata, KubernetesCollectorService, RabbitMqCollectorService,
  FeignClientsFromSourceCodeProducer, AnnotationAnalyzer, SourceLocationDecorator,
  ExcludedNodesRemover, MicroserviceWithMessageExchangeMerger, CabinetTransformer, ElementMapping, GitStorageService, ConfigService
} from 'tadis-analyzer'

@Injectable()
export class CustomCollectorService {

  constructor(
    private readonly kubernetesCollector: KubernetesCollectorService,
    private readonly rabbitMqCollector: RabbitMqCollectorService,
    private readonly feignClientsFromSourceCodeProducer: FeignClientsFromSourceCodeProducer,
    private readonly annotationAnalyzer: AnnotationAnalyzer,
    private readonly sourceLocationDecorator: SourceLocationDecorator,
    private readonly excludedNodesRemover: ExcludedNodesRemover,
    private readonly microserviceWithMessageExchangeMerger: MicroserviceWithMessageExchangeMerger,
    private readonly cabinetTransformer: CabinetTransformer,
    private readonly gitStorage: GitStorageService,
    private readonly configService: ConfigService
  ) { }

  public async getAllMicroservices(): Promise<MicroService[]> {
    return this.kubernetesCollector.getAllMicroservices()
  }

  public async getSystem(): Promise<System> {
    let system = new System('')

    system = await this.getAllMicroservicesFromSourceFolder()
    // system = await this.kubernetesCollector.transform(system)
    // system = await this.rabbitMqCollector.transform(system)

    system = await this.feignClientsFromSourceCodeProducer.transform(system)

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
    system = await this.annotationAnalyzer.transform(system, 'EventProcessor', elementMappings)
    system = await this.sourceLocationDecorator.transform(system)

    system = await this.excludedNodesRemover.transform(system)
    system = await this.microserviceWithMessageExchangeMerger.transform(system)
    system = await this.cabinetTransformer.transform(system)

    return system
  }

  private async getAllMicroservicesFromSourceFolder(): Promise<System> {
    const storageStatus = await this.gitStorage.getStorageStatus()
    const metadata: Metadata = {
      transformer: 'custom git sources to microservices',
      context: this.configService.getSourceFolder()
    }
    const system = new System('System')
    storageStatus.forEach(status => {
      system.addMicroService(status.name, undefined, metadata)
    })
    return system
  }
}
