import { ConfigService } from '../../config/Config.service'

import { ExcludedNodesRemover } from './ExcludedNodesRemover'
import { System, AsyncEventFlow } from '../../model/ms'

jest.mock('../../kubernetes/api/api.service')
jest.mock('../../config/Config.service')

describe(ExcludedNodesRemover.name, () => {

  it('removes nodes to be excluded', async() => {
    const inputSystem = new System('system')

    const serviceAAA = inputSystem.addMicroService('AAA')
    inputSystem.addMessageExchange('AAA')
    const exchangeC = inputSystem.addMessageExchange('C')
    inputSystem.edges.push(new AsyncEventFlow(serviceAAA, exchangeC))

    const serviceD = inputSystem.addMicroService('D')
    inputSystem.edges.push(new AsyncEventFlow(exchangeC, serviceD))

    const serviceE = inputSystem.addMicroService('E')
    inputSystem.edges.push(new AsyncEventFlow(serviceD, serviceE))

    ConfigService.prototype.getExcludedNodeNames = jest.fn().mockImplementation(() => {
      return ['A.*', 'C']
    })

    const config = new ConfigService()
    const nodeRemover = new ExcludedNodesRemover(config)
    const system = await nodeRemover.transform(inputSystem)

    expect(system.findMicroService('A')).toBeUndefined()
    expect(system.findMessageExchange('C')).toBeUndefined()
    expect(system.findMicroService('D')).toBeDefined()
    expect(system.findMicroService('E')).toBeDefined()
    expect(system.nodes).toHaveLength(2)

    expect(system.edges).toHaveLength(1)
    expect(system.edges[0].source.id).toEqual(serviceD.id)
    expect(system.edges[0].target.id).toEqual(serviceE.id)

    expect(system.content.metadata.transformer).toEqual(ExcludedNodesRemover.name)
    expect(system.content.metadata.info).toEqual('AAA, C')
  })
})
