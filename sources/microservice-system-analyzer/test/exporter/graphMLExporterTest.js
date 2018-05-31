let describe = require('mocha').describe
let it = require('mocha').it
let expect = require('chai').expect

let graphMLExporter = require('../../src/exporter/graphMLExporter')
let fs = require('fs')

let modelClasses = require('../../src/model/modelClasses')
let System = modelClasses.System
let Link = modelClasses.Link

describe('graphML exporter', function () {
  it('can export a system', function () {
    let system = new System([new Link('A', 'B', 'sync')])

    let xml = graphMLExporter.getGraphML(system)

    let expectedXmlFile = process.cwd() + '/test/exporter/data/basic.graphml'
    let expectedXml = fs.readFileSync(expectedXmlFile, 'utf8')
    expect(xml).to.equal(expectedXml)
  })

  it('can export a system that has subsystems', function () {
    let system = new System()
    system.addSubSystem('A')
    system.getSubSystem('A').addService('A')
    system.getSubSystem('A').addService('B')
    system.getSubSystem('A').addLink('A', 'B', 'sync')
    system.addService('C')
    system.links = [new Link('A', 'C', 'sync')]

    let xml = graphMLExporter.getGraphML(system)

    let expectedXmlFile = process.cwd() + '/test/exporter/data/subgraph.graphml'
    let expectedXml = fs.readFileSync(expectedXmlFile, 'utf8')
    expect(xml).to.equal(expectedXml)
  })
})
