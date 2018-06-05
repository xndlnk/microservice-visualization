const describe = require('mocha').describe
const it = require('mocha').it
const beforeEach = require('mocha').beforeEach
const expect = require('chai').expect

const feignClientImporter = require('../../src/importer/feignClientImporter')
const modelClasses = require('../../src/model/modelClasses')
const Service = modelClasses.Service
const Link = modelClasses.Link

describe('feign client importer', function () {
  beforeEach(function () {
    process.env.SOURCE_FOLDER = process.cwd() + '/test/importer/data/feignClientSource'
  })

  it('can import', async () => {
    const system = await feignClientImporter.getSystem()

    expect(system.services.length).to.equal(4)
    expect(system.services).to.deep.contain(new Service('service1'))
    expect(system.services).to.deep.contain(new Service('service3'))
    expect(system.links).to.deep.contain(new Link('service1', 'service3', 'sync'))
    expect(system.services).to.deep.contain(new Service('service2'))
    expect(system.services).to.deep.contain(new Service('service4'))
  })

  it('can import with links in reverse', async () => {
    const system = await feignClientImporter.getSystemWithLinksInReverse()

    expect(system.links).to.deep.contain(new Link('service3', 'service1', 'sync'))
    expect(system.links).to.deep.contain(new Link('service4', 'service2', 'sync'))
  })
})
