import { System, MicroService } from '../../model/ms'

export interface Collector {
  getAllMicroservices(): Promise<MicroService[]>
  getSystem(): Promise<System>
}
