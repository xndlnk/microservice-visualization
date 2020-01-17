# Customized Analyzer Example

This project contains examples of customized TADIS analyzers.

## Getting Started

Before discussing the example analyzer, lets get started and see the analysis and visualization in action. The first step is to checkout the repository at [https://github.com/MaibornWolff/microservice-visualization](). Then the analyzer and its UI are started as separate communicating processes.

### Run the Customized Analyzer

1. Change directory to `customized-analyzer-example`.
2. Run `docker-compose up`. This will run the following microservices:
- tadis-ui on port 8080 providing a graphical representation of the system graph.
- customized-analyzer-example on port 8081 providing the system graph as JSON by analyzing source code in source folder `./dummy-system-source`.
3. Access JSON representation of analyzed dummy system: [http://localhost:8081/collect/system]()
4. Open base path to TADIS-UI in browser: [http://localhost:8080]()
5. Navigate to HTML view: [http://localhost:8080/tadis/html/]()

## The Customized Analyzer Explained

The first custom analyzer in `my-source-only-collector/` is a simple one. It discovers a system from static source code analysis only. A more complicated example, which is contained in `complex-collector/`, is discussed in the next section.

Each example analyzer defines a collector which is responsible for discovering a system from different sources by using various transformers. Some transformers are already provided by the tadis-analyzer.

### Collector for Simple Source Code Analysis

The example is made up of the following resources:

**`main.ts`**

bootstraps the nest.js application and starts a web server at the port defined in the `.env` file

**`app.module.ts`**

contains the applications main nest.js module. Among others, it imports the module `MySourceOnlyCollectorModule`. This the module that defines our customizations.

**`my-source-only-collector/MySourceOnlyCollector.module.ts`**

defines a customized module with a new collector service. The module `MySourceOnlyCollectorModule` specifies a replacement for the `DefaultCollectorService`, which is used by the generic REST controller in `CollectorController`, by a custom `MySourceOnlyCollectorService`. The replacing collector is required to implement the following Collector interface methods.

```
export interface Collector {
  getAllMicroservices(): Promise<MicroService[]>
  getSystem(): Promise<System>
}
```

**`my-source-only-collector/MySourceOnlyCollector.service.ts`**

holds the `MySourceOnlyCollectorService`. It uses a source code pattern analyzer which is provided by the module `SourcePatternDslModule`. The pattern analyzer is then used in `EventProcessorSourceAnalyzer`. 

**`my-source-only-collector/EventProcessorSourceAnalyzer.service.ts`**

defines the `EventProcessorSourceAnalyzer`. It is made up of a transform method that creates the system from the provided source code patterns.

### Complex Collector

A far more complex example collector is defined in [complex-collector/CustomCollector.service.ts](./src/complex-collector/CustomCollector.service.ts).

...