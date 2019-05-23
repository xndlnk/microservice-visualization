import { Get, Controller, Logger, Query } from '@nestjs/common'

import { CollectorService } from './Collector.service'
import { GitStorageService } from '../source-code-analysis/git/GitStorage.service'

import { adaptToV1 } from '../model/v1-legacy/v1-adapter'
import { convertCoreToTransportNode } from '../model/transport'

@Controller('collect')
export class CollectorController {
  private readonly logger = new Logger(CollectorController.name)

  constructor(
    private readonly collector: CollectorService,
    private readonly gitStorage: GitStorageService
  ) { }

  @Get('system')
  async getSystem(@Query('version') version: string): Promise<any> {
    const system = await this.collector.getSystem()

    if (version === '1') {
      return adaptToV1(system)
    }

    return convertCoreToTransportNode(system)
  }

  // TODO: more RESTy with @Patch('system-source') ?
  @Get('source')
  async storeSource(): Promise<string> {
    this.storeSystemSource()
    return 'started storing in background ...'
  }

  async storeSystemSource() {
    const microservices = await this.collector.getAllMicroservices()
    for (const microservice of microservices) {
      // TODO: this could be faster when we let store be executed in parallel until a certain limit is reached.
      // see https://stackoverflow.com/questions/53144401/limit-the-number-of-concurrent-child-processes-spawned-in-a-loop-in-node-js
      await this.gitStorage.gitStorage.storeRepository(microservice.getName())
    }
    this.logger.log('finished storing system source')
  }

}
