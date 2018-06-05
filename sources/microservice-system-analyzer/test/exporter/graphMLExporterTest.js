const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect

const graphMLExporter = require('../../src/exporter/graphMLExporter')
const fs = require('fs')

const modelClasses = require('../../src/model/modelClasses')
const System = modelClasses.System
const Link = modelClasses.Link

describe('graphML exporter', function () {
  it('can export a system', function () {
    const system = new System([new Link('A', 'B', 'sync')])

    const xml = graphMLExporter.getGraphML(system)

    const expectedXmlFile = process.cwd() + '/test/exporter/data/basic.graphml'
    const expectedXml = fs.readFileSync(expectedXmlFile, 'utf8')
    expect(xml).to.equal(expectedXml)
  })

  it('can export a system that has subsystems', function () {
    const system = new System()
    system.addSubSystem('A')
    system.getSubSystem('A').addService('A')
    system.getSubSystem('A').addService('B')
    system.getSubSystem('A').addLink('A', 'B', 'sync')
    system.addService('C')
    system.links = [new Link('A', 'C', 'sync')]

    const xml = graphMLExporter.getGraphML(system)

    const expectedXmlFile = process.cwd() + '/test/exporter/data/subgraph.graphml'
    const expectedXml = fs.readFileSync(expectedXmlFile, 'utf8')
    expect(xml).to.equal(expectedXml)
  })
})
