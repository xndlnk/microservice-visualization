# Microservice Visualization with the Tool for Architecture Discovery (TADIS)

## TL;DR

## Sources

- [tadis-analyzer](sources/tadis-analyzer) - analyzer backend
- [tadis-analyzer-custom-example](sources/tadis-analyzer-custom-example) - example customization of tadis-analyzer
- [tadis-ui](sources/tadis-ui) - web-frontend based on D3

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

- env configuration variables
- build
- deployment
- debugging

## Microservice Systems Architecture

### Model

### Transformers Overview

### Kubernetes Transformers

- MicroservicesFromKubernetesCreator
- EnvDefinitionFromPodDecorator
- LabelsFromDeploymentDecorator

### Java Transformers

- FeignClientAnnotationAnalyzer
- JavaAnnotationAnalyzer (non-MSA)

### RabbitMQ Transformers

- RabbitMqBindingsFromApiAnalyzer
- ExchangesFromEnvPayloadCreator
- OutgoingExchangesFromSourceCreator
- MicroserviceWithOutgoingExchangeMerger

### Common Transformers (non-MSA)

- StaticNodeFilter
- SubSystemFromPayloadTransformer

### Sub-System Transformer

Use this transformer when you have a flat system where some nodes have a payload defining their association to a sub-system and you want the system to be transformed to a system of sub-systems. This transformer creates new sub-system nodes and moves each node to its sub-system node.

[see SubSystemTransformer.ts](sources/tadis-analyzer/src/msa/common/SubSystemTransformer.ts)

## Related Work

## Future Work

## Acknowledgments
