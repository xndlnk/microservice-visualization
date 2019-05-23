import { ConfigService } from '../../config/config.service'

import { ExcludedNodesRemover } from './ExcludedNodesRemover'
import { System, AsyncEventFlow } from '../../model/ms'

jest.mock('../../kubernetes/api/api.service')
jest.mock('../../config/config.service')

describe(ExcludedNodesRemover.name, () => {

  beforeAll(async() => {
    ConfigService.prototype.getExcludedNodeNames = jest.fn().mockImplementation(() => {
      return 'A, C'
    })
  })

  it('removes nodes to be excluded', async() => {
    const inputSystem = new System('system')
    const serviceA = inputSystem.addMicroService('A')
    inputSystem.addMicroService('B')
    const exchangeC = inputSystem.addMessageExchange('C')
    inputSystem.edges.push(new AsyncEventFlow(serviceA, exchangeC))

    const config = new ConfigService()
    const nodeRemover = new ExcludedNodesRemover(config)
    const system = await nodeRemover.transform(inputSystem)

    expect(system.nodes).toHaveLength(1)
    expect(system.edges).toHaveLength(0)
    expect(system.nodes[0].content.payload.name).toEqual('B')
  })
})
