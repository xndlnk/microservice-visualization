import { Injectable } from '@nestjs/common'
import { System, MicroService } from 'acmi-analyzer'

@Injectable()
export class CustomCollectorService {

  public async getAllMicroservices(): Promise<MicroService[]> {
    return []
  }

  public async getSystem(): Promise<System> {
    return new System('my')
  }
}
