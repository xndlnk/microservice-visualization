import { CabinetTransformer } from './CabinetTransformer'
import { System, AsyncEventFlow } from '../../model/ms'

jest.mock('../../kubernetes/api/api.service')
jest.mock('../../config/Config.service')

describe(CabinetTransformer.name, () => {

  it('service with cabinet label is moved to sub-system node', async() => {
    const inputSystem = new System('system')
    const serviceA = inputSystem.addMicroService('A')
    serviceA.getPayload().labels = { cabinet: 'X' }
    const serviceB = inputSystem.addMicroService('B')

    const cabinetTransformer = new CabinetTransformer()
    const system = await cabinetTransformer.transform(inputSystem)

    expect(system.nodes).toHaveLength(2)
    expect(system.nodes[0].content.payload.name).toEqual('X')
    expect(system.nodes[0].content.type).toEqual('System')
    expect(system.nodes[0].nodes).toHaveLength(1)
    expect(system.nodes[0].nodes[0].content.payload.name).toEqual('A')

    expect(system.nodes[1].content.payload.name).toEqual('B')
  })

  it('edges of moved nodes are moved', async() => {
    const inputSystem = new System('system')

    const serviceA = inputSystem.addMicroService('A')
    serviceA.getPayload().labels = { cabinet: 'X' }
    const serviceC = inputSystem.addMicroService('C')
    serviceC.getPayload().labels = { cabinet: 'X' }
    inputSystem.edges.push(new AsyncEventFlow(serviceA, serviceC))

    const serviceB = inputSystem.addMicroService('B')
    inputSystem.edges.push(new AsyncEventFlow(serviceA, serviceB))

    const cabinetTransformer = new CabinetTransformer()
    const system = await cabinetTransformer.transform(inputSystem)

    expect(system.edges).toHaveLength(1)
    expect(system.edges[0].source.id).toEqual(serviceA.id)
    expect(system.edges[0].target.id).toEqual(serviceB.id)

    const cabinetX = system.findNodeWithNameInPayload<System>(System, 'X')
    expect(cabinetX.edges).toHaveLength(1)
    expect(cabinetX.edges[0].source.id).toEqual(serviceA.id)
    expect(cabinetX.edges[0].target.id).toEqual(serviceC.id)
  })
})
