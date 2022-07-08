# Custom Analyzer Example

This project contains two examples of custom TADIS analyzers:

1. a working simple analyzer to get you started with and
2. a Kubernetes system analyzer that serves as an example of what a complex analyzer can look like.

## Getting Started: The Simple Analyzer

The simple analyzer reads the source code of a fictitious system and transforms it to a graph.
For source code analysis, one has to define a source folder that will contain the source code
of all the microservices of a system, i.e. each sub-folder is interpreted as a microservice
in the system. The source folder is defined by the environment variable `SOURCE_FOLDER`.

There is a docker-compose file for running the analyzer and the visualizer together.

1. Run `docker-compose --env-file .env-public-default up`. This will start the two services:
    - **custom-analyzer** (on port 8081) analyzes the source code and creates a system graph as JSON.
    - **tadis-ui** (on port 8080) reads the system graph and displays it graphically.
    - See `.env-public-default` file for config options.
2. Open analysis result as JSON graph: [http://localhost:8081/collect/system]()
3. Open HTML view to see graphical representation: [http://localhost:8080/tadis/html/]()

## The Simple Analyzer Explained

The simple analyzer is made up of a collector which is responsible for discovering
a system from different sources. The collector runs a number of so-called tranformers
to assemble a system from different sources. You can add your own transformers or
you can use general-purpose transformers provided by the tadis-analyzer,
e.g. a RabbitMQ transformer.

### Files

**`main.ts`** bootstraps the nest.js application and starts a web server.

**`app.module.ts`** contains the applications main nest.js module.

**`simple-analyzer/SimpleSystemAssembler.service.ts`** contains the SimpleSystemAssembler that is used to create
a representation of the microservice system.

**`simple-analyzer/SimpleSystemAssembler.module.ts`** contains a nest.js module that provides the SimpleSystemAssembler.
The SimpleSystemAssembler is defined as a replacement for the `SystemAssembler`, which is used by
the generic REST controller in `SystemAssemblerController`.

### Importing Microservice Source Code

In this example, the source code of the target system is already included.
In a real system, you would import the source code of the microservices
into the folder defined by `SOURCE_FOLDER`.

The tadis-analyzer provides some REST endpoints to import or update the source code
from a GIT repository. Let's run the simple analyzer with a different `SOURCE_FOLDER`
and then import the source code of the microservice-visualization as an example.

1. Run `docker-compose --env-file .env-public-import up`
2. Run `curl http://localhost:8081/source/store/repository/microservice-visualization`
3. Open HTML view to see graphical representation: [http://localhost:8080/tadis/html/]()

You will a see a different graph now. The microservice-visualization is considered
the only microservice.

## The More Complex System Analyzer

It can be found in [complex-analyzer/ComplexSystemAssembler.service.ts](src/complex-analyzer/ComplexSystemAssembler.service.ts).
It utilizes a number of transformers from the MsaModule of the tadis-analyzer.
