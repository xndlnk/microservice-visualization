import { Injectable } from "@nestjs/common";

import {
  System,
  MicroService,
  ElementMapping,
  SourceLocationDecorator,
  GitStorageService,
  ConfigService,
  StaticNodeFilter,
  JavaAnnotationAnalyzer,
  FeignClientAnnotationAnalyzer,
  Metadata,
  Collector,
} from "tadis-analyzer";

@Injectable()
export class SimpleSystemAssembler implements Collector {
  constructor(
    private readonly feignClientAnnotationAnalyzer: FeignClientAnnotationAnalyzer,
    private readonly javaAnnotationAnalyzer: JavaAnnotationAnalyzer,
    private readonly sourceLocationDecorator: SourceLocationDecorator,
    private readonly nodeFilter: StaticNodeFilter,
    private readonly gitStorage: GitStorageService,
    private readonly configService: ConfigService
  ) {}

  public async getAllMicroservices(): Promise<MicroService[]> {
    const system = await this.getAllMicroservicesFromSourceFolder();
    return system.getMicroServices();
  }

  private async getAllMicroservicesFromSourceFolder(): Promise<System> {
    const storageStatus = await this.gitStorage.getStorageStatus();
    const metadata: Metadata = {
      transformer: "custom git sources to microservices",
      context: this.configService.getSourceFolder(),
    };
    const system = new System("System");
    storageStatus.forEach((status) => {
      system.addMicroService(status.name, undefined, metadata);
    });
    return system;
  }

  public async getSystem(): Promise<System> {
    let system = await this.getAllMicroservicesFromSourceFolder();

    system = await this.feignClientAnnotationAnalyzer.transform(system);

    const elementMappings: ElementMapping[] = [
      {
        elementToDeriveNodeFrom: "sendToExchange",
        nodeTypeToCreate: "MessageExchange",
        nodeTypeDirection: "target",
        edgeType: "AsyncEventFlow",
      },
      {
        elementToDeriveNodeFrom: "receiveFromExchange",
        nodeTypeToCreate: "MessageExchange",
        nodeTypeDirection: "source",
        edgeType: "AsyncEventFlow",
      },
    ];
    system = await this.javaAnnotationAnalyzer.transform(
      system,
      "EventProcessor",
      elementMappings
    );
    system = await this.sourceLocationDecorator.transform(system);

    system = await this.nodeFilter.transform(system);

    return system;
  }
}
