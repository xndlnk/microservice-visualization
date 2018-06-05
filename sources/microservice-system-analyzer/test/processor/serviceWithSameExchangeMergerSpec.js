const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect

const modelClasses = require('../../src/model/modelClasses')
const System = modelClasses.System
const Service = modelClasses.Service
const Link = modelClasses.Link

const merger = require('../../src/processor/serviceWithSameExchangeMerger')

describe('service with same exchange merger', function () {
  it('can merge services that are linked with an equally named exchange into just one node', function () {
    const consulSystem = new System()
    consulSystem.addService('A')
    consulSystem.addService('B')
    consulSystem.addService('C')
    consulSystem.addService('D')
    consulSystem.addService('E')

    const rabbitImporter = new System([
      new Link('exchange A', 'B'),
      new Link('exchange P', 'D'),
      new Link('exchange B', 'E')
    ])

    const sendToImporter = new System([
      new Link('A', 'exchange A'),
      new Link('B', 'exchange P'),
      new Link('C', 'exchange P'),
      new Link('D', 'exchange B')
    ])

    const mergedSystem = merger.mergeSystems([
      consulSystem,
      rabbitImporter,
      new System([
        new Link('A', 'F'),
        new Link('B', 'F')
      ]),
      sendToImporter
    ])

    expect(mergedSystem.services).to.deep.contain(new Service('A'))
    expect(mergedSystem.services).not.to.deep.contain(new Service('exchange A'))

    expect(mergedSystem.services).to.deep.contain(new Service('B'))
    expect(mergedSystem.services).to.deep.contain(new Service('D'))
    expect(mergedSystem.services).to.deep.contain(new Service('D'))
    expect(mergedSystem.services).to.deep.contain(new Service('E'))
    expect(mergedSystem.services).to.deep.contain(new Service('F'))

    expect(mergedSystem.services).to.deep.contain(new Service('exchange P'))
    expect(mergedSystem.services).to.deep.contain(new Service('exchange B'))

    expect(mergedSystem.links).not.to.deep.contain(new Link('A', 'exchange A'))
    expect(mergedSystem.links).to.deep.contain(new Link('A', 'B'))
    expect(mergedSystem.links).to.deep.contain(new Link('B', 'exchange P'))
    expect(mergedSystem.links).to.deep.contain(new Link('C', 'exchange P'))
    expect(mergedSystem.links).to.deep.contain(new Link('exchange P', 'D'))
    expect(mergedSystem.links).to.deep.contain(new Link('D', 'exchange B'))
    expect(mergedSystem.links).to.deep.contain(new Link('exchange B', 'E'))

    expect(mergedSystem.links).to.deep.contain(new Link('A', 'F'))
    expect(mergedSystem.links).to.deep.contain(new Link('B', 'F'))
  })
})
