let describe = require('mocha').describe
let beforeEach = require('mocha').beforeEach
let it = require('mocha').it
let expect = require('chai').expect

let serviceFilter = require('../../src/filter/serviceFilter')
let modelClasses = require('../../src/model/modelClasses')
let System = modelClasses.System
let Service = modelClasses.Service
let Link = modelClasses.Link

describe('service filter', function () {
  beforeEach(function () {
    process.env.IGNORED_SERVICES = 'A'
  })

  it('removes services which contain configured names', function () {
    let system = new System([
      new Link('A', 'B'), new Link('xA', 'B'), new Link('Ax', 'B'), new Link('', 'B')
    ])

    let filteredSystem = serviceFilter.filterSystem(system)

    expect(filteredSystem.services).to.not.deep.contain(new Service('A'))
    expect(filteredSystem.services).to.not.deep.contain(new Service('xA'))
    expect(filteredSystem.services).to.not.deep.contain(new Service('Ax'))
    expect(filteredSystem.services).to.not.deep.contain(new Service(''))
    expect(filteredSystem.services).to.deep.contain(new Service('B'))
  })

  it('removes by full name', function () {
    let system = new System([new Link('A', 'B')])

    serviceFilter.removeServicesByName(system, ['A'])

    expect(system.services).to.not.deep.contain(new Service('A'))
    expect(system.services).to.deep.contain(new Service('B'))
  })

  it('removes by name beginning', function () {
    let system = new System([new Link('Axx', 'Bxx')])

    serviceFilter.removeServicesByNameStartsWith(system, ['A'])

    expect(system.services).to.not.deep.contain(new Service('Axx'))
    expect(system.services).to.deep.contain(new Service('Bxx'))
  })

  it('removes by name ending', function () {
    let system = new System([new Link('xxA', 'xxB')])

    serviceFilter.removeServicesByNameEndsWith(system, ['A'])

    expect(system.services).to.not.deep.contain(new Service('xxA'))
    expect(system.services).to.deep.contain(new Service('xxB'))
  })
})
