import { System, MicroService } from '../../model/ms'

export interface ISystemAssembler {
  getAllMicroservices(): Promise<MicroService[]>
  getSystem(): Promise<System>
}
