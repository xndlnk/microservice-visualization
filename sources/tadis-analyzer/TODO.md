# TODOs

- strict type checks
- introduce interface for extractors to chain them

## new structure

- system-assemblers or analyzers?
    - DefaultCollector -> EmptyAssembler
    - KubernetesRabbitMqAssembler
- system-element-extractors or just extractors?
    - rabbitmq
    - java    
    - code-patterns
    - kubernetes
    - spring-feign
- post-processors
    - SubSystemFromPayloadTransformer
    - StaticNodeFilter
    - MicroserviceWithOutgoingExchangeMerger
- utils
    - files
- git
- config
- models
  - core
  - ms

## controllers

- /collect/source -> /system/import_source
- /collect/system -> /system
- /source/store/repository/:repositoryName -> /git/import/:repositoryName
