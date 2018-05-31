let describe = require('mocha').describe
let it = require('mocha').it
let expect = require('chai').expect

const modelClasses = require('../../src/model/modelClasses')
const System = modelClasses.System
const Service = modelClasses.Service
const Link = modelClasses.Link
const Property = modelClasses.Property
const subSystemTransformer = require('../../src/processor/subSystemTransformer')

/* eslint-disable no-unused-expressions */
describe('sub system transformer', function () {
  it('can transform cabinet properties to sub systems', function () {
    let system = new System([new Link('A', 'B'), new Link('A', 'C'), new Link('A', 'D')])
    system.getService('A').addProperty('cabinet', 'X')
    system.getService('B').addProperty('cabinet', 'X')
    system.getService('D').addProperty('cabinet', 'Y')

    let transformedSystem = subSystemTransformer.transform(system)

    expect(transformedSystem.services).to.deep.equal([new Service('C')])
    expect(transformedSystem.links).to.deep.equal([new Link('A', 'C'), new Link('A', 'D')])

    expect(transformedSystem.hasSubSystem('X')).to.be.true
    expect(transformedSystem.getSubSystem('X').services)
      .to.deep.equal([
        new Service('A', [new Property('cabinet', 'X')]),
        new Service('B', [new Property('cabinet', 'X')])])
    expect(transformedSystem.getSubSystem('X').links).to.deep.equal([new Link('A', 'B')])

    expect(transformedSystem.hasSubSystem('Y')).to.be.true
    expect(transformedSystem.getSubSystem('Y').services).to.deep.equal([new Service('D', [new Property('cabinet', 'Y')])])
    expect(transformedSystem.getSubSystem('Y').links).to.deep.equal([])
  })
})
