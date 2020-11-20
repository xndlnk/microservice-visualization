import { Injectable } from '@nestjs/common'

import { System, MicroService } from '../../model/ms'
import { ISystemAssembler } from './ISystemAssembler'

@Injectable()
export class SystemAssembler implements ISystemAssembler {
  public async getAllMicroservices(): Promise<MicroService[]> {
    return []
  }

  public async getSystem(): Promise<System> {
    return new System('')
  }
}
