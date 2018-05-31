let describe = require('mocha').describe
let it = require('mocha').it
let beforeEach = require('mocha').beforeEach
let expect = require('chai').expect
let nock = require('nock')

let rabbitmq = require('../../src/importer/rabbitmqManagementImporter')
let modelClasses = require('../../src/model/modelClasses')
let Service = modelClasses.Service

let rabbitMqPath = 'http://rabbitmq'

describe('rabbitmq importer', function () {
  let testQueueName = 'dataquality.do.update'
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
    let queuesData = [{'name': 'dataquality.do.update'}]
    queuesRequestMock.reply(200, queuesData)

    let bindingsdata = [
      {
        source: '',
        vhost: '/',
        destination: 'dataquality.do.update',
        destination_type: 'queue',
        routing_key: 'dataquality.do.update',
        arguments: { },
        properties_key: 'dataquality.do.update'
      },
      {
        source: 'dataquality',
        vhost: '/',
        destination: 'dataquality.do.update',
        destination_type: 'queue',
        routing_key: 'dataquality.do.update',
        arguments: { },
        properties_key: 'dataquality.do.update'
      }
    ]
    bindingsRequestMock.reply(200, bindingsdata)

    let system = await rabbitmq.getSystem()

    expect(system.services).to.deep.contain(new Service('dataquality'))
  })
})
