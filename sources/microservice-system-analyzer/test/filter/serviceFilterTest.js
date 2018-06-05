const describe = require('mocha').describe
const beforeEach = require('mocha').beforeEach
const it = require('mocha').it
const expect = require('chai').expect

const serviceFilter = require('../../src/filter/serviceFilter')
const modelClasses = require('../../src/model/modelClasses')
const System = modelClasses.System
const Service = modelClasses.Service
const Link = modelClasses.Link

describe('service filter', function () {
  beforeEach(function () {
    process.env.IGNORED_SERVICES = 'A'
  })

  it('removes services which contain configured names', function () {
    const system = new System([
      new Link('A', 'B'), new Link('xA', 'B'), new Link('Ax', 'B'), new Link('', 'B')
    ])

    const filteredSystem = serviceFilter.filterSystem(system)

    expect(filteredSystem.services).to.not.deep.contain(new Service('A'))
    expect(filteredSystem.services).to.not.deep.contain(new Service('xA'))
    expect(filteredSystem.services).to.not.deep.contain(new Service('Ax'))
    expect(filteredSystem.services).to.not.deep.contain(new Service(''))
    expect(filteredSystem.services).to.deep.contain(new Service('B'))
  })

  it('removes by full name', function () {
    const system = new System([new Link('A', 'B')])

    serviceFilter.removeServicesByName(system, ['A'])

    expect(system.services).to.not.deep.contain(new Service('A'))
    expect(system.services).to.deep.contain(new Service('B'))
  })

  it('removes by name beginning', function () {
    const system = new System([new Link('Axx', 'Bxx')])

    serviceFilter.removeServicesByNameStartsWith(system, ['A'])

    expect(system.services).to.not.deep.contain(new Service('Axx'))
    expect(system.services).to.deep.contain(new Service('Bxx'))
  })

  it('removes by name ending', function () {
    const system = new System([new Link('xxA', 'xxB')])

    serviceFilter.removeServicesByNameEndsWith(system, ['A'])

    expect(system.services).to.not.deep.contain(new Service('xxA'))
    expect(system.services).to.deep.contain(new Service('xxB'))
  })
})
