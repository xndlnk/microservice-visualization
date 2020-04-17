# Backlog

## Next Tasks

### Release v1.0

- 🔷 document code

### Improve RabbitMQ transformer

- ️❇️ use queues API to check for consumers. if no consumers are connected to a queue, display the event flow in grey color.

### Improve Service Split

- ️🔷 move service exchange merger from analyzer to viewer and make it a selectable action of the view

### Others

- ❇️ feign client transformer supports @RequestParam annotation in parameter list
- ❇️ add metadata for transformers adding payload fields `payload.metadata.fieldName: Metadata`
- 🔷 enable strict type checking
- ️❇️ allow manual additions but clearly mark them as manual
- ️❇️ develop source analysis DSL
- ️❇️ define feign and java annotation analyzer by using source analysis DSL
- ️❇️ add self-analysis of the analyzer <- ⚠️ analysis DSL
- ❇️ step source-transform: angular rest calls (optional) <- ⚠️ analysis DSL
- ❇️ configurable orchestrator: orchestration of steps is defined by configuration

## Tasks to be refined

- new react-based viewer
- logging-based analysis
- live source code analysis

# Technologies

## Implementation Technologies

- Node.js
- TypeScript
- Nest
- Git
- Docker

## Supported Technologies in Analysis

- Kubernetes
- RabbitMQ
- Spring Feign Client Annotations
- Java Annotations
