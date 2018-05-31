let describe = require('mocha').describe
let it = require('mocha').it
let expect = require('chai').expect

const modelClasses = require('../../src/model/modelClasses')
const System = modelClasses.System
const Service = modelClasses.Service
const Link = modelClasses.Link
const systemMerger = require('../../src/processor/systemMerger')

describe('system merger', function () {
  it('can merge systems', function () {
    let systems = [
      new System([new Link('A', 'B')]),
      new System([new Link('B', 'C')]),
      new System([new Link('C', 'D')])
    ]

    let system = systemMerger.mergeSystems(systems)

    expect(system.services).to.deep.contain(new Service('A'))
    expect(system.services).to.deep.contain(new Service('B'))
    expect(system.services).to.deep.contain(new Service('C'))
    expect(system.services).to.deep.contain(new Service('D'))
  })
})
