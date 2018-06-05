const describe = require('mocha').describe
const beforeEach = require('mocha').beforeEach
const it = require('mocha').it
const expect = require('chai').expect

const configRepository = require('../../src/config/configRepository')

describe('config repository', function () {
  beforeEach(function () {
    process.env.IGNORED_SERVICES = '  a, b ,c , d '
  })

  it('parses ignored services', function () {
    const ignoredServices = configRepository.getIgnoredServices()
    expect(ignoredServices.length).to.equal(4)
    expect(ignoredServices).to.eql(['a', 'b', 'c', 'd'])
  })
})
