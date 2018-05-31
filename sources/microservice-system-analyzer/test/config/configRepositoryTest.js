let describe = require('mocha').describe
let beforeEach = require('mocha').beforeEach
let it = require('mocha').it
let expect = require('chai').expect

let configRepository = require('../../src/config/configRepository')

describe('config repository', function () {
  beforeEach(function () {
    process.env.IGNORED_SERVICES = '  a, b ,c , d '
  })

  it('parses ignored services', function () {
    let ignoredServices = configRepository.getIgnoredServices()
    expect(ignoredServices.length).to.equal(4)
    expect(ignoredServices).to.eql(['a', 'b', 'c', 'd'])
  })
})
