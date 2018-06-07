const fileHelper = require('./importer/fileHelper')
const feignClientImporter = require('./importer/feignClientImporter')
const rabbitmqManagementImporter = require('./importer/rabbitmqManagementImporter')
const consulImporter = require('./importer/consulImporter')
const gitRepositoryImporter = require('./importer/gitRepositoryImporter')
const graphMLExporter = require('./exporter/graphMLExporter')
const configRepository = require('./config/configRepository')
const model = require('./model/modelClasses')
const serviceFilter = require('./filter/serviceFilter')
const subSystemTransformer = require('./processor/subSystemTransformer')
const systemMerger = require('./processor/systemMerger')
const serviceWithSameExchangeMerger = require('./processor/serviceWithSameExchangeMerger')

module.exports = {
  configRepository,
  model,
  importer: {
    fileHelper,
    feignClientImporter,
    rabbitmqManagementImporter,
    consulImporter,
    gitRepositoryImporter
  },
  exporter: {
    graphMLExporter
  },
  filter: {
    serviceFilter
  },
  processor: {
    subSystemTransformer,
    systemMerger,
    serviceWithSameExchangeMerger
  }
}
