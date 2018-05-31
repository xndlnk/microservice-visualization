let fileHelper = require('./importer/fileHelper')
let feignClientImporter = require('./importer/feignClientImporter')
let rabbitmqManagementImporter = require('./importer/rabbitmqManagementImporter')
let consulImporter = require('./importer/consulImporter')
let gitRepositoryImporter = require('./importer/gitRepositoryImporter')
let graphMLExporter = require('./exporter/graphMLExporter')
let obfuscator = require('./exporter/obfuscator')
let configRepository = require('./config/configRepository')
let model = require('./model/modelClasses')
let serviceFilter = require('./filter/serviceFilter')
let subSystemTransformer = require('./processor/subSystemTransformer')
let systemMerger = require('./processor/systemMerger')

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
    graphMLExporter,
    obfuscator
  },
  filter: {
    serviceFilter
  },
  processor: {
    subSystemTransformer,
    systemMerger
  }
}
