let describe = require('mocha').describe
let beforeEach = require('mocha').beforeEach
let it = require('mocha').it
let expect = require('chai').expect
let nock = require('nock')

let consul = require('../../src/importer/consulImporter')
let modelClasses = require('../../src/model/modelClasses')
let Service = modelClasses.Service

let consulPath = 'http://consul'

describe('consul importer', function () {
  let consulRequestMock

  beforeEach(function () {
    process.env.CONSUL_PATH = consulPath
    consulRequestMock = nock(consulPath).get('/v1/catalog/services')
  })

  it('can fetch the services', async () => {
    consulRequestMock.reply(200, { serviceA: [], serviceB: [] })

    let system = await consul.getSystem()
    expect(system.services.length).to.equal(2)
    expect(system.services).to.deep.contain(new Service('serviceA'))
    expect(system.services).to.deep.contain(new Service('serviceB'))
  })

  it('can filter consul services', async () => {
    consulRequestMock.reply(200, { consulX: [] })

    let system = await consul.getSystem()
    expect(system.services.length).to.equal(0)
  })
})
