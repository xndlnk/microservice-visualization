import { MicroserviceWithMessageExchangeMerger } from './MicroserviceWithMessageExchangeMerger'
import { System, AsyncEventFlow, MicroService } from '../../model/ms'

describe(MicroserviceWithMessageExchangeMerger.name, () => {

  it('can merge in standard case', async() => {
    const inputSystem = new System('system')
    const serviceA = inputSystem.addMicroService('A')
    const serviceB = inputSystem.addMicroService('B')
    const exchangeB = inputSystem.addMessageExchange('B')
    const serviceC = inputSystem.addMicroService('C')
    inputSystem.edges.push(new AsyncEventFlow(serviceA, serviceB))
    inputSystem.edges.push(new AsyncEventFlow(serviceB, exchangeB))
    inputSystem.edges.push(new AsyncEventFlow(exchangeB, serviceC))

    const merger = new MicroserviceWithMessageExchangeMerger()
    const system = await merger.transform(inputSystem)

    expect(system.nodes).toHaveLength(3)
    const mergedServiceB = system.nodes.find(node => node.content.payload.name === 'B' && node.content.type === MicroService.name)
    expect(mergedServiceB).toBeDefined()
    expect(mergedServiceB.content.payload.reduced).toEqual(true)

    expect(system.edges).toHaveLength(2)
    expect(system.edges.find(edge => edge.source.hasName('A') && edge.target.hasName('B'))).toBeDefined()
    expect(system.edges.find(edge => edge.source.hasName('B') && edge.target.hasName('C'))).toBeDefined()
  })

  it('can redirect other nodes connected to the exchange to the corresponding service', async() => {
    const inputSystem = new System('system')
    const serviceX = inputSystem.addMicroService('X')
    const serviceB = inputSystem.addMicroService('B')
    const exchangeB = inputSystem.addMessageExchange('B')
    inputSystem.edges.push(new AsyncEventFlow(serviceB, exchangeB))
    inputSystem.edges.push(new AsyncEventFlow(serviceX, exchangeB))

    const merger = new MicroserviceWithMessageExchangeMerger()
    const system = await merger.transform(inputSystem)

    expect(system.nodes).toHaveLength(2)
    const mergedServiceB = system.nodes.find(node => node.content.payload.name === 'B' && node.content.type === MicroService.name)
    expect(mergedServiceB).toBeDefined()
    expect(mergedServiceB.content.payload.reduced).toEqual(true)

    expect(system.edges).toHaveLength(1)
    expect(system.edges.find(edge => edge.source.hasName('X') && edge.target.hasName('B'))).toBeDefined()
  })

  it('can merge and keeps unconnected nodes', async() => {
    const inputSystem = new System('system')
    inputSystem.addMicroService('A')
    const serviceB = inputSystem.addMicroService('B')
    const exchangeB = inputSystem.addMessageExchange('B')

    inputSystem.edges.push(new AsyncEventFlow(serviceB, exchangeB))

    const merger = new MicroserviceWithMessageExchangeMerger()
    const system = await merger.transform(inputSystem)

    expect(system.nodes).toHaveLength(2)
  })

  it('does not merge exchanges which are connected to differently named services', async() => {
    const inputSystem = new System('system')
    const serviceA = inputSystem.addMicroService('A')
    const exchangeB = inputSystem.addMessageExchange('B')

    inputSystem.edges.push(new AsyncEventFlow(serviceA, exchangeB))

    const merger = new MicroserviceWithMessageExchangeMerger()
    const system = await merger.transform(inputSystem)

    expect(system.nodes).toHaveLength(2)
    expect(system.nodes).toContain(serviceA)
    expect(system.nodes).toContain(exchangeB)
  })

  it('does not merge exchanges which are connected to nodes of same name but of a type different from MicroService', async() => {
    const inputSystem = new System('system')
    const exchangeA = inputSystem.addMessageExchange('A')
    const queueA = inputSystem.addMessageQueue('A')

    inputSystem.edges.push(new AsyncEventFlow(exchangeA, queueA))

    const merger = new MicroserviceWithMessageExchangeMerger()
    const system = await merger.transform(inputSystem)

    expect(system.nodes).toHaveLength(2)
    expect(system.nodes).toContain(exchangeA)
    expect(system.nodes).toContain(queueA)
  })

  it('merges properties of service and exchange', async() => {
    const inputSystem = new System('system')
    const serviceB = inputSystem.addMicroService('B', { p: 1 })
    const exchangeB = inputSystem.addMessageExchange('B', { q: 2 })

    inputSystem.edges.push(new AsyncEventFlow(serviceB, exchangeB))

    const merger = new MicroserviceWithMessageExchangeMerger()
    const system = await merger.transform(inputSystem)

    expect(system.nodes).toHaveLength(1)
    expect(system.nodes[0].content.payload.p).toEqual(1)
    expect(system.nodes[0].content.payload.q).toEqual(2)
  })
})
