import { KubernetesApiService } from '../api/api.service'
import { ConfigService } from '../../../config/Config.service'
import { MicroservicesFromKubernetesCreator } from './MicroservicesFromKubernetesCreator'

import { body as testBodyServices } from './testdata/api/services.json'
import { body as testBodyPods } from './testdata/api/pods.json'
import { verifyEachContentHasTransformer } from '../../../test/verifiers'

jest.mock('../api/api.service')
jest.mock('../../../config/Config.service')

describe(MicroservicesFromKubernetesCreator.name, () => {

  beforeAll(async() => {
    ConfigService.prototype.getKubernetesNamespace = jest.fn().mockImplementation(() => {
      return 'test-ns'
    })

    KubernetesApiService.prototype.getServices = jest.fn().mockImplementation(() => {
      return testBodyServices
    })

    KubernetesApiService.prototype.getPods = jest.fn().mockImplementation(() => {
      return testBodyPods
    })
  })

  it('transforms', async() => {
    const config = new ConfigService()
    const apiService = new KubernetesApiService(config)

    const kubernetesService = new MicroservicesFromKubernetesCreator(config, apiService)
    const system = await kubernetesService.transform(null)

    expect(system).not.toBeNull()
    expect(system.getPayload().name).toEqual('test-ns')
    expect(system.nodes).toHaveLength(1)
    expect(system.nodes[0].content.payload.name).toEqual('test-microservice')

    verifyEachContentHasTransformer(system, MicroservicesFromKubernetesCreator.name)
  })
})
