let describe = require('mocha').describe
let it = require('mocha').it
let beforeEach = require('mocha').beforeEach
let expect = require('chai').expect

let feignClientImporter = require('../../src/importer/feignClientImporter')
let modelClasses = require('../../src/model/modelClasses')
let Service = modelClasses.Service
let Link = modelClasses.Link

describe('feign client importer', function () {
  beforeEach(function () {
    process.env.SOURCE_FOLDER = process.cwd() + '/test/importer/data/feignClientSource'
  })

  it('can import', async () => {
    let system = await feignClientImporter.getSystem()

    expect(system.services.length).to.equal(4)
    expect(system.services).to.deep.contain(new Service('service1'))
    expect(system.services).to.deep.contain(new Service('service3'))
    expect(system.links).to.deep.contain(new Link('service1', 'service3', 'sync'))
    expect(system.services).to.deep.contain(new Service('service2'))
    expect(system.services).to.deep.contain(new Service('service4'))
  })

  it('can import with links in reverse', async () => {
    let system = await feignClientImporter.getSystemWithLinksInReverse()

    expect(system.links).to.deep.contain(new Link('service3', 'service1', 'sync'))
    expect(system.links).to.deep.contain(new Link('service4', 'service2', 'sync'))
  })
})
