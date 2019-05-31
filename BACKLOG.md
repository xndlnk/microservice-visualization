# Backlog

## Next Tasks

- ⭕️ add decorator for services pointing to their source code (or missing)
- ️⭕️ generalize java annotation analyzer
- ⭕️ add debug data in analyzer (including missing source repos)
  - refactor: move transformerName to metadata.transformerName
- ️⭕️ add debug mode to viewer
- ️⭕️ display system name in viewer title
- ️⭕️ use red color for nodes without source and make this a configurable option
- ️⭕️ move service exchange merger from analyzer to viewer and make it a selectable action of the view
- ⭕️ mark old analyzer library as deprecated
- ⭕️ rename viewer to acmi-viewer-d3, align package.json scripts: yarn start...
- ⭕️ create new release bundle of analyzer + viewer
- ⭕️ update documentation
- ️⭕️ allow manual additions but clearly mark them as manual (pink color)
- ️⭕️ develop source analysis DSL
- ️⭕️ add self-analysis of the analyzer <- ⚠️ analysis DSL
- 🔲 step source-transform: angular rest calls (optional) <- ⚠️ analysis DSL
- 🔲 build npm library with Nest modules
- 🔲 configurable orchestrator
  - orchestration of steps is defined by configuration
  ```
  - create-from-kubernetes-services
  - add-kubernetes-env-vars
  - add-exchanges-from-env-vars
  - add-kubernetes-labels
  - add-source-locations: examines source folder and adds a local source path to each service
  - add-exchanges-from-source
  - add-feign-clients-from-source
  - add-exchanges-from-rabbitmq-api
  - transform-to-cabinets
  ```

## Completed Tasks

- ✅ source-storage
- ✅ kubernetes API
- ✅ static orchestrator
  - each step is a transform of an input to an output system
  - the next transform step gets the output of the previous one as its input
  - each step is implemented in a separate file
  - with this strategy, no system merger is needed
  - each transform can be very specific. all of them are part of the generic analyzer. there maybe an configurable abstraction in the future if it will ever be needed.
- ✅ step: kubernetes service discovery is a transform of any input to a system of services
- ✅ step: add kubernetes env vars
- ✅ step: rabbitmq exchange flows defined via env variables
- ✅ step source-transform: feign clients
- ️✅ step source-transform: outgoing rabbitmq exchange
- ✅ step: rabbit management api
- ✅ Dockerfile
- ✅ step: store source for all current microservices
- ✅ add model adapter fitting microservice-system-viewer
- ✅ manual filter to remove certain nodes (optional)
- ✅ step: adds labels from k8s deployments
- ✅ step: cabinet transformer (to re-use current viewer)
- ✅ step: service-exchange-merger

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
