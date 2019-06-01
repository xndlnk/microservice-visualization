import { Injectable } from '@nestjs/common'
import * as _ from 'lodash'

import { System, MicroService } from '../model/ms'

@Injectable()
export class CustomCollectorService {

  public async getAllMicroservices(): Promise<MicroService[]> {
    return []
  }

  public async getSystem(): Promise<System> {
    return new System('my')
  }
}
