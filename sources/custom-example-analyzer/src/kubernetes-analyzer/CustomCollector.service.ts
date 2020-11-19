import { Injectable } from '@nestjs/common'

import {
  System,
  MicroService,
  ElementMapping,
  SourceLocationDecorator,
  SubSystemFromPayloadTransformer,
  MicroserviceWithOutgoingExchangeMerger,
  StaticNodeFilter,
  JavaAnnotationAnalyzer,
  FeignClientAnnotationAnalyzer,
  MicroservicesFromKubernetesCreator,
  RabbitMqBindingsFromApiAnalyzer,
  OutgoingExchangesFromSourceCreator,
  ExchangesFromEnvPayloadCreator,
  EnvDefinitionFromPodDecorator,
  LabelsFromDeploymentDecorator, Collector
} from 'tadis-analyzer'

@Injectable()
export class CustomCollectorService implements Collector {

  constructor(
    private readonly microservicesCreator: MicroservicesFromKubernetesCreator,
    private readonly envDefinitionFromPodDecorator: EnvDefinitionFromPodDecorator,
    private readonly labelsFromDeploymentDecorator: LabelsFromDeploymentDecorator,
    private readonly rabbitMqBindingsAnalyzer: RabbitMqBindingsFromApiAnalyzer,
    private readonly outgoingExchangesCreator: OutgoingExchangesFromSourceCreator,
    private readonly exchangesFromEnvPayloadCreator: ExchangesFromEnvPayloadCreator,
    private readonly feignClientAnnotationAnalyzer: FeignClientAnnotationAnalyzer,
    private readonly javaAnnotationAnalyzer: JavaAnnotationAnalyzer,
    private readonly sourceLocationDecorator: SourceLocationDecorator,
    private readonly nodeFilter: StaticNodeFilter,
    private readonly microserviceWithOutgoingExchangeMerger: MicroserviceWithOutgoingExchangeMerger,
    private readonly subSystemTransformer: SubSystemFromPayloadTransformer
  ) { }

  public async getAllMicroservices(): Promise<MicroService[]> {
    const system = await this.microservicesCreator.transform(new System(''))
    return system.getMicroServices()
  }

  public async getSystem(): Promise<System> {
    return this.getSystemFromKubernetesRabbitMqSourceCode()
  }

  private async getSystemFromKubernetesRabbitMqSourceCode(): Promise<System> {
    let system = new System('')

    system = await this.microservicesCreator.transform(system)
    system = await this.envDefinitionFromPodDecorator.transform(system)
    system = await this.labelsFromDeploymentDecorator.transform(system)

    system = await this.rabbitMqBindingsAnalyzer.transform(system)
    system = await this.exchangesFromEnvPayloadCreator.transform(system)
    system = await this.outgoingExchangesCreator.transform(system)

    system = await this.feignClientAnnotationAnalyzer.transform(system)

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
    system = await this.javaAnnotationAnalyzer.transform(system, 'EventProcessor', elementMappings)
    system = await this.sourceLocationDecorator.transform(system)

    system = await this.nodeFilter.transform(system)
    system = await this.microserviceWithOutgoingExchangeMerger.transform(system)

    system = await this.subSystemTransformer.transform(system, SubSystemFromPayloadTransformer.getSubSystemNameFromCabinetLabel)

    return system
  }
}
