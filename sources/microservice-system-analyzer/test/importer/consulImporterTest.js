const describe = require('mocha').describe
const beforeEach = require('mocha').beforeEach
const it = require('mocha').it
const expect = require('chai').expect
const nock = require('nock')

const consul = require('../../src/importer/consulImporter')
const modelClasses = require('../../src/model/modelClasses')
const Service = modelClasses.Service

const consulPath = 'http://consul'

describe('consul importer', function () {
  let consulRequestMock

  beforeEach(function () {
    process.env.CONSUL_PATH = consulPath
    consulRequestMock = nock(consulPath).get('/v1/catalog/services')
  })

  it('can fetch the services', async () => {
    consulRequestMock.reply(200, { serviceA: [], serviceB: [] })

    const system = await consul.getSystem()
    expect(system.services.length).to.equal(2)
    expect(system.services).to.deep.contain(new Service('serviceA'))
    expect(system.services).to.deep.contain(new Service('serviceB'))
  })

  it('can filter consul services', async () => {
    consulRequestMock.reply(200, { consulX: [] })

    const system = await consul.getSystem()
    expect(system.services.length).to.equal(0)
  })
})
