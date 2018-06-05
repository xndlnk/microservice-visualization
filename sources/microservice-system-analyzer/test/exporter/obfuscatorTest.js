const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect

const obfuscator = require('../../src/exporter/obfuscator')

const modelClasses = require('../../src/model/modelClasses')
const System = modelClasses.System
const Link = modelClasses.Link

/* eslint-disable no-unused-expressions */
describe('obfuscator exporter', function () {
  it('can obfuscate all the names', function () {
    const system = new System([new Link('ABC', 'BDE', 'sync')])
    const subSystemX = system.addSubSystem('X')
    subSystemX.addLink('C', 'D')

    const obfuscatedSystem = obfuscator.getSystem(system)

    expect(obfuscatedSystem.hasService('ABC')).to.be.false
    expect(obfuscatedSystem.hasService('BDE')).to.be.false
    expect(obfuscatedSystem.services.length).to.equal(2)
    expect(obfuscatedSystem.hasLink('ABC', 'BDE')).to.be.false
    expect(obfuscatedSystem.hasSubSystem('X')).to.be.false
    expect(obfuscatedSystem.subSystems.length).to.equal(1)
    expect(obfuscatedSystem.subSystems[0].hasService('C')).to.be.false
  })
})
