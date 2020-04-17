import { Injectable } from '@nestjs/common'

import { System, MicroService } from '../../model/ms'
import { Collector } from './Collector'

@Injectable()
export class DefaultCollectorService implements Collector {

  public async getAllMicroservices(): Promise<MicroService[]> {
    return []
  }

  public async getSystem(): Promise<System> {
    return new System('')
  }
}
