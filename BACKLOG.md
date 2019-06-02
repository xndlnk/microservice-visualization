# Backlog

## Next Tasks

### Improved Debugging

- ️❇️ add debug mode to viewer
- ️❇️ add no-cache action to viewer

### Release v1.0

- ️🔷 move service exchange merger from analyzer to viewer and make it a selectable action of the view
- 🔷 mark old analyzer library as deprecated
- 🔷 rename components to tadis...
- 🔷 align package.json scripts: yarn start...
- 🔷 create new release bundle of analyzer + viewer with equal versions
- 🔷 update documentation

### Others

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
