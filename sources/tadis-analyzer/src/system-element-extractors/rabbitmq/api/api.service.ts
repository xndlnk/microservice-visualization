import { HttpService, Injectable, Logger } from '@nestjs/common'

import { ConfigService } from '../../../config/Config.service'
import { AxiosRequestConfig } from 'axios'

@Injectable()
export class RabbitMqManagementApiService {
  private readonly logger = new Logger(RabbitMqManagementApiService.name)

  constructor(
    private config: ConfigService,
    private httpService: HttpService
  ) {}

  public async getQueues(): Promise<any> {
    const url = this.config.getRabbitUrl() + '/api/queues/'
    this.logger.log('get queues from url ' + url)
    return this.getData(url)
  }

  public async getBindings(queueName: string): Promise<any[]> {
    const vhost = '/'

    const url =
      this.config.getRabbitUrl() +
      '/api/queues/' +
      encodeURIComponent(vhost) +
      '/' +
      encodeURIComponent(queueName) +
      '/bindings/'

    this.logger.log('get bindings for ' + queueName + ' from url ' + url)
    return this.getData(url)
  }

  private async getData(url) {
    const axiosConfig = this.getAxiosConfig()

    try {
      const response = await this.httpService.axiosRef.get(url, axiosConfig)
      return response.data
    } catch (error) {
      this.logger.error(
        'sending request failed, using options: ' + JSON.stringify(axiosConfig)
      )
      throw error
    }
  }

  private getAxiosConfig(): AxiosRequestConfig {
    if (this.config.getRabbitUser() && this.config.getRabbitPassword()) {
      return {
        auth: {
          username: this.config.getRabbitUser(),
          password: this.config.getRabbitPassword()
        }
      }
    }
    return undefined
  }
}
