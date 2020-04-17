import { Injectable, Logger } from '@nestjs/common'
import * as request from 'request-promise-native'

import { ConfigService } from '../../../config/Config.service'

@Injectable()
export class RabbitMqManagementApiService {
  private readonly logger = new Logger(RabbitMqManagementApiService.name)

  constructor(private config: ConfigService) {
  }

  public async getQueues(): Promise<any> {
    const url = this.config.getRabbitUrl() + '/api/queues/'
    this.logger.log('get queues from url ' + url)
    return this.sendRequest(url, 'GET')
  }

  public async getBindings(queueName: string): Promise<any[]> {
    // TODO: make vhost configurable
    const vhost = '/'
    const url = this.config.getRabbitUrl() + '/api/queues/' + encodeURIComponent(vhost) + '/' + encodeURIComponent(queueName) + '/bindings/'
    this.logger.log('get bindings for ' + queueName + ' from url ' + url)
    return this.sendRequest(url, 'GET')
  }

  private async sendRequest(url, method) {
    const options: any = {
      method: method,
      url: url
    }

    if (this.config.getRabbitUser() && this.config.getRabbitPassword()) {
      // TODO: auth type should be configurable
      options.auth = {
        user: this.config.getRabbitUser(),
        password: this.config.getRabbitPassword()
      }
    }

    try {
      // TODO: maybe change this to use axios provided bei Nest.js
      const response = await request(options)
      return JSON.parse(response)
    } catch (error) {
      throw new Error('sending request failed, using options: ' + JSON.stringify(options))
    }
  }

}
