const describe = require('mocha').describe
const it = require('mocha').it
const beforeEach = require('mocha').beforeEach
const expect = require('chai').expect
const nock = require('nock')

const rabbitmq = require('../../src/importer/rabbitmqManagementImporter')
const modelClasses = require('../../src/model/modelClasses')
const Service = modelClasses.Service
const Link = modelClasses.Link

const rabbitMqPath = 'http://rabbitmq'

describe('rabbitmq importer', function () {
  const testQueueName = 'diagnosticdata.trainrunevent.publish.update'
  const queuesUrl = '/api/queues/'
  const bindingsUrl = '/api/queues/' + encodeURIComponent('/') + '/' + encodeURIComponent(testQueueName) + '/bindings/'
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

    const system = await rabbitmq.getSystem()

    expect(system.services).to.deep.contain(new Service('exchange trainrunevent'))
    expect(system.services).to.deep.contain(new Service('diagnosticdata'))
    expect(system.links).to.deep.contain(new Link('exchange trainrunevent', 'diagnosticdata', 'async'))
  })
})
