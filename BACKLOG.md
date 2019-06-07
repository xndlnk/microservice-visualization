# Backlog

## Next Tasks

### Release v1.0

- ️❇️ cabinet transformation: move each exchange which is the target of a node coming from a cabinet to this cabinet
- 🔷 update documentation

### Improved Service Split

- ️🔷 move service exchange merger from analyzer to viewer and make it a selectable action of the view

### Improved Debugging

- ️❇️ add debug mode to viewer

### Others

- ❇️ feign client transformer supports @RequestParam annotation in parameter list
- ❇️ add metadata for transformers adding payload fields `payload.metadata.fieldName: Metadata`
- 🔷 enable strict type checking
- ️❇️ allow manual additions but clearly mark them as manual (pink color)
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
