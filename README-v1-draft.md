# Microservice Visualization with TADIS - a Tool for Architecture Discovery

## TL;DR

## Sources

- [tadis-analyzer](sources/tadis-analyzer) - analyzer backend
- [tadis-analyzer-custom-example](sources/tadis-analyzer-custom-example) - example customization of tadis-analyzer
- [tadis-ui](sources/tadis-ui) - web-frontend based on D3 and Graphviz

## Introduction

## Problem

- ...
- application performance analysis is out of scope

## Use Cases

## Assumptions

- every system uses different implementation technology
- its hard to write and maintain runtime analyzers for many different technologies
- each system is mostly implemented with the same technologies and by following common coding conventions

## Approach

## Model

(the generic node model)

## Implementation

### Analyzer

- terminology: collector, creator, decorator, transformer
- common modules: config, git, source-analysis, node-filter, annotation-analyzer

### Custom Analyzer

### UI

- v1 legacy model vs. v2 model
- Graphviz

### Configuration and Usage

- build
- deployment
- debugging

Environment Variables:
- PORT
- SOURCE_FOLDER
- GIT_BASE_URLS

## Microservice Systems Architecture

### Model

### Transformers Overview

### Kubernetes Transformers

Environment Variables:
- KUBERNETES_NAMESPACE: All transformers use this fixed namespace.

Assumptions in each transformer:
- `pod.metadata.name` starts with a microservice name which is followed by minus character, e.g. `microservicename-8648fc44bb-5qnm8`
- this assumption is violated if you use minus in your microservice names and if you have multiple microservices beginning with the same name

#### MicroservicesFromKubernetesCreator

- gets all services and pods from the Kubernetes namespace
- creates a microservice for each service that also has a pod
- assumptions:
  - `service.metadata.name` is a microservice name

#### EnvDefinitionFromPodDecorator

- gets all pods from the Kubernetes namespace
- adds attribute `env` of each `container` in `pod.spec.containers` to the payload of the microservice

#### LabelsFromDeploymentDecorator

- gets all deployments from the Kubernetes namespace
- adds attribute `labels` from `deployment.metadata.labels` to the payload of the microservice

### Java Transformers

#### FeignClientAnnotationAnalyzer

- searches in the source code of each microservice for `*.java` files for the pattern `/@FeignClient\s*\(\s*(value\s*=)?\s*"([\w-]+)"/`
- for each value creates a SyncDataFlow between the current microservice and the target microservice referred to in value

#### JavaAnnotationAnalyzer (non-MSA)

- an attempt to generalize analyzers for Java annotations
- the transform method is passed an annotation to search for and actions defined as mapping of annotation elements to graph extensions
- [see source code](sources/tadis-analyzer/src/java/JavaAnnotationAnalyzer.ts) for details

````typescript
transform(system: System, annotation: string, elementMappings: ElementMapping[]): Promise<System> { ... }
````

### RabbitMQ Transformers

#### RabbitMqBindingsFromApiAnalyzer

- uses the [RabbitMQ Management Plugin](https://www.rabbitmq.com/management.html)
- gets all queue to exchange bindings for each queue via `/api/queues/<vhost>/<queueName>/bindings/` (only supports vhost `/`)
- if queue name equals `<microservice-name>.<text>` for any existing microservice
  - then an AsyncEventFlow is created between the exchange and microservice
  - else a MessageQueue is created and used instead of the microservice

Environment Variables:
- RABBIT_USER and RABBIT_PASSWORD for use in basic auth
- RABBIT_URL: base URL to RabbitMQ Management API

#### ExchangesFromEnvPayloadCreator

- searches in each node payload for an `env` attribute
- the `env` attribute must be of type EnvEntry[]

````typescript
type EnvEntry = {
  name: string,
  value: string
}
````

- for each `env.name` that contains the string `EXCHANGE`
  - if the `env.name` also contains the string `OUTGOING` then an AsyncEventFlow is added between the current microservice and the exchange defined in `env.value`
  - if instead the `env.name` also contains the string `INCOMING`then an AsyncEventFlow is added from the exchange towards the current microservice

#### OutgoingExchangesFromSourceCreator

- searches in the source code of each microservice for `.java` files that also have `send` in their filename
- searches for variable assignments matching the pattern `/exchange[\w]*[\s]*=\s*"(\w+)"/ig` where the expression identifies the exchange that is used for sending messages.
- for each sending exchange found, creates an AsyncEventFlow between the current microservice and the exchange

#### MicroserviceWithOutgoingExchangeMerger

- searches for microservice nodes having just one outgoing exchange whose name equals the name of the microservice node
- merges each such exchange into the microservice node, including payload and metadata, and adds the payload `reduced=true` to the node

### Common Transformers (non-MSA)

#### SourceLocationDecorator

Adds payload `sourceLocation` to each microservice where source code was fetched via Git.

#### StaticNodeFilter

Filters nodes from a flat system.

Environment Variables:
- EXCLUDED_NODE_NAMES
  - comma-separated list of names
  - regular expressions may be used
  - example: dummy.*, foo

#### SubSystemFromPayloadTransformer

Use this transformer when you have a flat system where some nodes have a payload defining their association to a sub-system and you want the system to be transformed to a system of sub-systems. This transformer creates new sub-system nodes and moves each node to its sub-system node.

How sub-system information is to be extracted from a nodes payload must be specified when calling the transformer.

[see SubSystemTransformer.ts](sources/tadis-analyzer/src/msa/common/SubSystemTransformer.ts)

## Related Work

## Future Work

## Acknowledgments
