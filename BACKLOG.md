# Backlog

## Next Tasks

### Improved Debugging

- ❇️ add debug data in analyzer (including missing source repos)
  - refactor: move transformerName to metadata.transformerName
  - add metadata to all transformers
  - add metadata for payload fields: `payload.metadata.fieldName = 'decorator'`
- ️❇️ generalize java annotation analyzer
- ️❇️ add debug mode to viewer
- ️❇️ display system name in viewer title
- ️❇️ use red color for nodes without source and make this a configurable option

### Release v1.0

- ️🔷 move service exchange merger from analyzer to viewer and make it a selectable action of the view
- 🔷 mark old analyzer library as deprecated
- 🔷 rename viewer to acmi-viewer-d3, align package.json scripts: yarn start...
- 🔷 create new release bundle of analyzer + viewer
- 🔷 update documentation

### Far Future

- 🔷 enable strict type checking
- ️❇️ allow manual additions but clearly mark them as manual (pink color)
- ️❇️ develop source analysis DSL
- ️❇️ add self-analysis of the analyzer <- ⚠️ analysis DSL
- ❇️ step source-transform: angular rest calls (optional) <- ⚠️ analysis DSL
- 🔷 build npm library with Nest modules
- ❇️ configurable orchestrator: orchestration of steps is defined by configuration

# Technologies

## Used for implementation

- Node.js
- TypeScript
- Nest
- Git
- Docker

## Supported in target systems

- Git
- Kubernetes
- RabbitMQ
- Spring Feign Clients
