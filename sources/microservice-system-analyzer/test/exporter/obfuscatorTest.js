let describe = require('mocha').describe
let it = require('mocha').it
let expect = require('chai').expect

let obfuscator = require('../../src/exporter/obfuscator')

let modelClasses = require('../../src/model/modelClasses')
let System = modelClasses.System
let Link = modelClasses.Link

/* eslint-disable no-unused-expressions */
describe('obfuscator exporter', function () {
  it('can obfuscate all the names', function () {
    let system = new System([new Link('ABC', 'BDE', 'sync')])
    let subSystemX = system.addSubSystem('X')
    subSystemX.addLink('C', 'D')

    let obfuscatedSystem = obfuscator.getSystem(system)

    expect(obfuscatedSystem.hasService('ABC')).to.be.false
    expect(obfuscatedSystem.hasService('BDE')).to.be.false
    expect(obfuscatedSystem.services.length).to.equal(2)
    expect(obfuscatedSystem.hasLink('ABC', 'BDE')).to.be.false
    expect(obfuscatedSystem.hasSubSystem('X')).to.be.false
    expect(obfuscatedSystem.subSystems.length).to.equal(1)
    expect(obfuscatedSystem.subSystems[0].hasService('C')).to.be.false
  })
})
