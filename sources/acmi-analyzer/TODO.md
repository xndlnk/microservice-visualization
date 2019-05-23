# TODO

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
- 🔲 step source-transform: angular rest calls (optional)
- ✅ step: rabbit management api
- ✅ Dockerfile
- ✅ step: store source for all current microservices
- ✅ add model adapter fitting microservice-system-viewer
- ✅ manual filter to remove certain nodes (optional)
- ✅ step: adds labels from k8s deployments
- ✅ step: cabinet transformer (to re-use current viewer)
- ✅ step: service-exchange-merger
- 🔲 build npm library with Nest modules
- 🔲 manual additions (optional)
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
  - steps could be placed in a git repository which is accessible via source-storage
  - then they could be loaded and evaluated dynamically from the source folder

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
