# microservice-system-viewer

The microservice-system-viewer is a Docker-based microservice that transforms a [system model](./src/server/model.ts) into HTML + SVG and provides it via a HTTP server. The viewer uses [viz.js](https://github.com/mdaines/viz.js) which is based on [Graphviz](http://www.graphviz.org/). It transforms a system model to DOT first and then from DOT to SVG.

Supported outputs:

- HTML
- SVG
- DOT

## Usage

### Configuration

The viewer needs to fetch the system from a URL. There are two options which are configured by environment variables. You may set the variables by placing them into a `.env` file in the viewers root directory.

a) Direct URL

- SYSTEM_PROVIDER_URL='https://mshost:8080/msvisualizer/subsystems/json'

b) Indirect discovery through Consul

- CONSUL_BASE_URL='https://consulhost:8080'
- SYSTEM_PROVIDER_SERVICE_NAME='analyzer'
- SYSTEM_PROVIDER_SERVICE_ENDPOINT='/subsystems/json'

Further configuration:

- NODE_ENV='production' enables production mode
- CACHE_TTL_SECONDS=300 sets the time to live of the cache
- PORT sets the port of the HTTP server, default is 8080 if PORT is not specified

### Running the HTTP server

- just execute: `npm run server`

### Accessing output

- http://localhost:8080/msvis/html/
- http://localhost:8080/msvis/svg/wikilinks
- http://localhost:8080/msvis/dot
- http://localhost:8080/msvis/json

### Options

In addition, the following options can be specified via query parameters:

- `?local=1` to use local example system as input (for debugging)
- `?last=1` to use last system successfully fetched (as fallback)
- `?anonymize=1` to anonymize all names