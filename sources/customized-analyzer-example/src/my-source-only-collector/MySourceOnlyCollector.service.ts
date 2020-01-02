import { Injectable } from '@nestjs/common'

import {
  System, MicroService, Metadata, GitStorageService, ConfigService
} from 'tadis-analyzer'

import { EventProcessorSourceAnalyzerService } from './EventProcessorSourceAnalyzer.service'

@Injectable()
export class MySourceOnlyCollectorService {

  constructor(
    private readonly eventProcessorAnalyzer: EventProcessorSourceAnalyzerService,
    private readonly gitStorage: GitStorageService,
    private readonly configService: ConfigService
  ) { }

  public async getAllMicroservices(): Promise<MicroService[]> {
    const system = await this.getAllMicroservicesFromSourceFolder()
    return system.getMicroServices()
  }

  public async getSystem(): Promise<System> {
    let system = await this.getAllMicroservicesFromSourceFolder()
    system = await this.eventProcessorAnalyzer.transform(system)

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
