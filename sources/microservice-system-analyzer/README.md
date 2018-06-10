# microservice-system-analyzer

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

This software determines the communication links in a system of microservices in order to visualize the topology of the system. The approach is based on analyzing static resources, e.g. REST APIs of infrastucture services and the source code of the microservices. For each source of information, a dedicated importer is responsible. Finally, all information is merged into a complete picture of the system. The approach is more lightweight as it does analyze dynamic communication. This is in contrast to APM solutions suchs as AppDynamics.

The analyzer collects information by

  1. accessing infrastructure services via REST APIs (e.g. Consul and RabbitMQ) and by
  2. parsing the source code of microservices.

## Example

[This is an example topology](./example-graph.png) created from analyzing a real system. It was created by using the layouting tool [yEd](https://www.yworks.com/yed) on the GraphML export (see GraphML exporter below).

## Architecture

Each importer collects information that provides a view of the system. This information is merged into a complete structure of the system. Exporters can transform the system to different formats. In each component, a unified system model is used to simplify integration.

![analyzer architecture](docs/architecture.png "analyzer architecture")

### Importers

- Spring FeignClients: An importer that searches for `@FeignClient` annotations in source code to capture synchronous communication links.
- RabbitMQ-Management: An importer for asynchronous communication links that accesses the RabbitMQ Management API. It requires to follow a schema for naming queues and exchanges.
  - A sending microservice has to send data to an exchange with the same name as the microservice. E.g. microservice A sends data to exchange A.
  - A receiving microservice creates a queue and binds it to an exchange. The name of the queue has to begin with name of the receiving microservice followed by a dot and any more characters. E.g. microservice B creates a queue B.foo and binds it to the exchange A.
- Consul
- Git-Repositories

### Exporters

- JSON
- GraphML

## Requirements

- Node.js 8
- Git CLI

## Getting started

### Tests

Tests can be run via `npm run test`.

### Configuration

The library is configured by the following environment variables:

  - CONSUL_PATH: URL to Consul HTTP API
  - RABBITMQ_PATH: URL to RabbitMQ Management HTTP API
  - GIT_REPOSITORY_PREFIX: Prefix for Git Repositories, e.g. `git@gitlab.yourOrganisation.de:group/`
  - IGNORED_SERVICES: comma separated list of services or part of service names to ignore in analysis
  - SOURCE_FOLDER: location of source files in the local file system which are imported with the Git importer

### Example usage of importers and merger

The library offers importers, exporters and a merger that have to be combined. The following code shows an example usage for merging the resulting systems of several importers.

```javascript
const analyzer = require('microservice-system-analyzer')

const consulImporter = analyzer.importer.consulImporter
const feignImporter = analyzer.importer.feignClientImporter
const rabbitmqImporter = analyzer.importer.rabbitmqManagementImporter

const systemMerger = analyzer.processor.systemMerger
const subSystemTransformer = analyzer.processor.subSystemTransformer

async function getSystem () {
  const consulSystem = await consulImporter.getSystem()
  const rabbitmqSystem = await rabbitmqImporter.getSystem()
  const feignSystem = await feignImporter.getSystemWithLinksInReverse()
  const mergedSystem = systemMerger.mergeSystems([consulSystem, rabbitmqSystem, feignSystem])

  return mergedSystem
}

async function getSystemWithSubSystems () {
  const flatSystem = await getSystem()
  const structuredSystem = subSystemTransformer.transform(flatSystem)

  return structuredSystem
}
```

### Example usage of Git importer

Some importers require source code that is usually available via Git repositories. The following example shows how to use the Git importer to get the source code.

```javascript
const analyzer = require('microservice-system-analyzer')

const gitImporter = analyzer.importer.gitRepositoryImporter
const configRepository = analyzer.configRepository

const sourcePath = gitImporter.importRepository(serviceName, getRepositoryName(serviceName))
// import is successfull if sourcePath is not null

function getRepositoryName (serviceName) {
  return configRepository.getGitRepositoryPrefix() + serviceName
}
```

### Example usage of GraphML exporter

The code below shows how to use the GraphML exporter on a system returned by a merger or an importer.

```javascript
const analyzer = require('microservice-system-analyzer')

const graphMLExporter = analyzer.exporter.graphMLExporter

const xml = graphMLExporter.getGraphML(system)
```

## License

[Apache License, Version 2.0](LICENSE)

Copyright 2017-2018 Andreas Blunk, MaibornWolff GmbH