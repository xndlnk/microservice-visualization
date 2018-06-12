const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect

const modelClasses = require('../../src/model/modelClasses')
const System = modelClasses.System
const Service = modelClasses.Service
const Link = modelClasses.Link
const Property = modelClasses.Property

/* eslint-disable no-unused-expressions */
describe('system model', function () {
  it('adds the same service just once', function () {
    const system = new System()
    system.addService('A')
    system.addService('B')
    system.addService('B')

    expect(system.services.length).to.equal(2)
    expect(system.services).to.deep.contain(new Service('A'))
    expect(system.services).to.deep.contain(new Service('B'))
    expect(system.hasService('A')).to.be.true
    expect(system.getService('A')).to.deep.equal(new Service('A'))
  })

  it('can create services from links', function () {
    const system = new System([new Link('A', 'B')])

    expect(system.links.length).to.equal(1)
    expect(system.services.length).to.equal(2)
  })

  it('adds services from added links', function () {
    const system = new System()

    system.addLink('A', 'B')

    expect(system.links.length).to.equal(1)
    expect(system.hasLink('A', 'B')).to.be.true
    expect(system.services.length).to.equal(2)
  })

  it('adds the same link only once', function () {
    const system = new System()

    system.addLink('A', 'B')
    system.addLink('A', 'B')

    expect(system.links.length).to.equal(1)
  })

  it('adds the same link with communiction only once', function () {
    const system = new System()

    system.addLink('A', 'B', 'sync')
    system.addLink('A', 'B', 'sync')

    expect(system.links.length).to.equal(1)
  })

  it('can remove services and their links', function () {
    const system = new System([new Link('A', 'B'), new Link('B', 'C')])

    system.removeServiceAndLinks('A')

    expect(system.services).to.not.deep.contain(new Service('A'))
    expect(system.services).to.deep.contain(new Service('B'))
    expect(system.services).to.deep.contain(new Service('C'))

    expect(system.links).to.not.deep.contain(new Link('A', 'B'))
    expect(system.links).to.deep.contain(new Link('B', 'C'))
  })

  it('can remove links but not their services', function () {
    const system = new System([new Link('A', 'B'), new Link('B', 'C')])

    system.removeLink('A', 'B')

    expect(system.services).to.deep.contain(new Service('A'))
    expect(system.services).to.deep.contain(new Service('B'))
    expect(system.services).to.deep.contain(new Service('C'))

    expect(system.links).to.not.deep.contain(new Link('A', 'B'))
    expect(system.links).to.deep.contain(new Link('B', 'C'))
  })

  it('can remove isolated services', function () {
    const system = new System([new Link('A', 'B'), new Link('B', 'C')])

    system.removeLink('A', 'B')
    system.removeIsolatedServices()

    expect(system.services).to.not.deep.contain(new Service('A'))
    expect(system.services).to.deep.contain(new Service('B'))
    expect(system.services).to.deep.contain(new Service('C'))
  })

  it('can copy a system deeply', function () {
    const system = new System([new Link('A', 'B'), new Link('B', 'C')])
    system.getService('A').addProperty('p', 1)
    system.addSubSystem('X')
    system.getSubSystem('X').addLink('A', 'B')

    const copy = system.copy()

    expect(system.services).to.deep.equal(copy.services)
    expect(system.getService('A').properties).to.deep.equal(copy.getService('A').properties)
    expect(system.links).to.deep.equal(copy.links)
    expect(system.subSystems).to.deep.equal(copy.subSystems)

    copy.removeServiceAndLinks('A')

    expect(copy.services).to.not.deep.contain(new Service('A'))
    expect(system.services).to.deep.contain(new Service('A', [new Property('p', 1)]))
  })

  it('can rename services', function () {
    const system = new System([new Link('A', 'B'), new Link('B', 'C')])

    system.renameService('A', 'X')

    expect(system.services).to.not.deep.contain(new Service('A'))
    expect(system.services).to.deep.contain(new Service('X'))
    expect(system.links).to.not.deep.contain(new Link('A', 'B'))
    expect(system.links).to.deep.contain(new Link('X', 'B'))
  })

  it('can add properties', function () {
    const system = new System([new Link('A', 'B'), new Link('B', 'C')])

    system.getService('A').addProperty('p', 1)

    expect(system.getService('A').hasProperty('p')).to.be.true
    expect(system.getService('A').getPropertyValue('p')).to.equal(1)
  })
})
