import { SubSystemTransformerService } from './SubSystemTransformer'
import { System, AsyncEventFlow } from '../../model/ms'
import { Node, Content } from '../../model/core'

jest.mock('../../kubernetes/api/api.service')
jest.mock('../../config/Config.service')

describe(SubSystemTransformerService.name, () => {

  it('moves each microservice which defines a cabinet label to its sub-system', async() => {
    const inputSystem = new System('system')
    const serviceA = inputSystem.addMicroService('A')
    serviceA.getPayload().labels = { cabinet: 'X' }
    const serviceB = inputSystem.addMicroService('B')

    const transformer = new SubSystemTransformerService()
    const system = await transformer.transform(inputSystem,
      SubSystemTransformerService.getSubSystemNameFromCabinetLabel)

    expect(system.nodes).toHaveLength(2)
    expect(system.nodes[0].content.payload.name).toEqual('X')
    expect(system.nodes[0].content.type).toEqual('System')
    expect(system.nodes[0].nodes).toHaveLength(1)
    expect(system.nodes[0].nodes[0].content.payload.name).toEqual('A')

    expect(system.nodes[1].content.payload.name).toEqual('B')
  })

  it('moves edges that connect nodes of the same cabinet to this cabinet', async() => {
    const inputSystem = new System('system')

    const serviceA = inputSystem.addMicroService('A')
    serviceA.getPayload().labels = { cabinet: 'X' }
    const serviceC = inputSystem.addMicroService('C')
    serviceC.getPayload().labels = { cabinet: 'X' }
    inputSystem.edges.push(new AsyncEventFlow(serviceA, serviceC))

    const serviceB = inputSystem.addMicroService('B')
    inputSystem.edges.push(new AsyncEventFlow(serviceA, serviceB))

    const transformer = new SubSystemTransformerService()
    const system = await transformer.transform(inputSystem,
      SubSystemTransformerService.getSubSystemNameFromCabinetLabel)

    expect(system.edges).toHaveLength(1)
    expect(system.edges[0].source.id).toEqual(serviceA.id)
    expect(system.edges[0].target.id).toEqual(serviceB.id)

    const cabinetX = system.findTypedNodeWithName<System>(System, 'X')
    expect(cabinetX.edges).toHaveLength(1)
    expect(cabinetX.edges[0].source.id).toEqual(serviceA.id)
    expect(cabinetX.edges[0].target.id).toEqual(serviceC.id)
  })

  it('moves outgoing nodes of microservices contained in a cabinet to the cabinet', async() => {
    const inputSystem = new System('system')

    const nodeA = new Node('A', new Content('T', undefined, { name: 'A' }))
    inputSystem.nodes.push(nodeA)

    const serviceB = inputSystem.addMicroService('B')
    serviceB.getPayload().labels = { cabinet: 'X' }

    const nodeC = new Node('C', new Content('T', undefined, { name: 'C' }))
    inputSystem.nodes.push(nodeC)

    inputSystem.edges.push(new AsyncEventFlow(nodeA, serviceB))
    inputSystem.edges.push(new AsyncEventFlow(serviceB, nodeC))

    const transformer = new SubSystemTransformerService()
    const system = await transformer.transform(inputSystem,
      SubSystemTransformerService.getSubSystemNameFromCabinetLabel)

    expect(system.findNodeOfTypeWithName('T', 'A')).toBeDefined()

    const cabinetX = system.nodes.find(node => node.getName() === 'X')
    expect(cabinetX.nodes.find(node => node.getName() === 'C'))
  })
})
