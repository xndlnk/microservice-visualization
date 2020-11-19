# TODOs

- strict type checks
- introduce interface for assemblers to chain them

## new structure

- system-assemblers
    - DefaultCollector -> EmptyAssembler
    - KubernetesRabbitMqAssembler
- element-extractors
    - async-event-flows
        - rabbitmq
        - ExchangesFromEnvPayloadCreator
    - generic
        - java-annotations    
        - code-patterns
    - microservices
        - kubernetes
    - sync-data-flows
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
