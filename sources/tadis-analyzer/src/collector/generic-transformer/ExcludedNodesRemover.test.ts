import { ConfigService } from '../../config/Config.service'

import { ExcludedNodesRemover } from './ExcludedNodesRemover'
import { System, AsyncEventFlow } from '../../model/ms'

jest.mock('../../kubernetes/api/api.service')
jest.mock('../../config/Config.service')

describe(ExcludedNodesRemover.name, () => {

  it('removes nodes to be excluded', async() => {
    const inputSystem = new System('system')
    const serviceA = inputSystem.addMicroService('AB')
    inputSystem.addMicroService('B')
    const exchangeC = inputSystem.addMessageExchange('C')
    inputSystem.edges.push(new AsyncEventFlow(serviceA, exchangeC))

    ConfigService.prototype.getExcludedNodeNames = jest.fn().mockImplementation(() => {
      return ['A.*', 'C']
    })

    const config = new ConfigService()
    const nodeRemover = new ExcludedNodesRemover(config)
    const system = await nodeRemover.transform(inputSystem)

    expect(system.findMicroService('A')).toBeUndefined()
    expect(system.findMicroService('B')).toBeDefined()
    expect(system.findMessageExchange('C')).toBeUndefined()
    expect(system.nodes).toHaveLength(1)
    expect(system.edges).toHaveLength(0)

    expect(system.content.metadata.transformer).toEqual(ExcludedNodesRemover.name)
    expect(system.content.metadata.info).toEqual('AB, C')
  })
})
