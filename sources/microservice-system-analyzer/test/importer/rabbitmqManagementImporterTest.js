let describe = require('mocha').describe
let it = require('mocha').it
let beforeEach = require('mocha').beforeEach
let expect = require('chai').expect
let nock = require('nock')

let rabbitmq = require('../../src/importer/rabbitmqManagementImporter')
let modelClasses = require('../../src/model/modelClasses')
let Service = modelClasses.Service
let Link = modelClasses.Link

let rabbitMqPath = 'http://rabbitmq'

describe('rabbitmq importer', function () {
  let testQueueName = 'diagnosticdata.trainrunevent.publish.update'
  let queuesUrl = '/api/queues/'
  let bindingsUrl = '/api/queues/' + encodeURIComponent('/') + '/' + encodeURIComponent(testQueueName) + '/bindings/'
  let queuesRequestMock
  let bindingsRequestMock

  beforeEach(function () {
    process.env.RABBITMQ_PATH = rabbitMqPath
    queuesRequestMock = nock(rabbitMqPath).get(queuesUrl)
    bindingsRequestMock = nock(rabbitMqPath).get(bindingsUrl)
  })

  it('can fetch the links', async () => {
    const queuesData = [{'name': testQueueName}]
    queuesRequestMock.reply(200, queuesData)

    const bindingsdata = [
      {
        source: '',
        vhost: '/',
        destination: 'diagnosticdata.trainrunevent.publish.update',
        destination_type: 'queue',
        routing_key: 'diagnosticdata.trainrunevent.publish.update',
        arguments: { },
        properties_key: 'diagnosticdata.trainrunevent.publish.update'
      },
      {
        source: 'trainrunevent',
        vhost: '/',
        destination: 'diagnosticdata.trainrunevent.publish.update',
        destination_type: 'queue',
        routing_key: 'trainrunevent.publish.update',
        arguments: { },
        properties_key: 'trainrunevent.publish.update'
      }
    ]
    bindingsRequestMock.reply(200, bindingsdata)

    let system = await rabbitmq.getSystem()

    expect(system.services).to.deep.contain(new Service('exchange trainrunevent'))
    expect(system.services).to.deep.contain(new Service('diagnosticdata'))
    expect(system.links).to.deep.contain(new Link('exchange trainrunevent', 'diagnosticdata', 'async'))
  })
})
