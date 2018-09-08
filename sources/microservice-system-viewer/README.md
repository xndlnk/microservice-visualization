# microservice-system-viewer

The microservice-system-viewer is a Docker-based microservice that transforms a [system model](./src/domain/model.ts) into HTML + SVG and provides it via a HTTP server. The viewer uses [graphviz-d3](https://github.com/magjac/d3-graphviz) which is ultimately based on [Graphviz](http://www.graphviz.org/). It transforms a system model to DOT first and then from DOT to SVG.

## Example

### Picture of zoomed in example system

![Example Visualization](docs/example.png "Example Visualization")

### Video of the viewer in action

It shows the focussing on single nodes by displaying theirs neighours only. And then neighbours and neighbours of neighbours and so on.

[![watch the viewer in action](https://img.youtube.com/vi/cD7M2gwV2PI/0.jpg)](https://youtu.be/cD7M2gwV2PI)

## Usage

### Quick start

If you just want to try the viewer and play with it, do the following:

- build the bundle that is used in [index.html](./src/html/index.html): `npm run dev`
- run the server that provides the index.html: `npm run server`
- access the [local example system](./src/exampleSystems/largeSystem.ts): `http://localhost:8080/msvis/html/?local=1`

### Configuration

The viewer needs to fetch the system that is to be visualized from a URL. There are two options which are configured by environment variables. You may set the variables by placing them into a `.env` file in the viewers root directory.

a) Direct URL

- SYSTEM_PROVIDER_URL='https://mshost:8080/msvisualizer/v1/subsystems/json'

b) Indirect discovery through [Consul service discovery](http://consul.io/)

- CONSUL_BASE_URL='https://consulhost:8080'
- SYSTEM_PROVIDER_SERVICE_NAME='analyzer'
- SYSTEM_PROVIDER_SERVICE_ENDPOINT='/subsystems/json'

Further configuration:

- NODE_ENV='production' enables production mode
- CACHE_TTL_SECONDS=300 sets the time to live of the cache
- PORT sets the port of the HTTP server, default is 8080 if PORT is not specified

### Running the HTTP server

- local execution:
  - `npm run dev`
  - `npm run server`
- execution via docker container:
  - `npm run docker-build`
  - `npm run docker-run`
    (expects `.env` file with environment variables in current directory)

### Accessing output

- http://localhost:8080/msvis/html/

### Options

In addition, the following options can be specified via query parameters:

- `?local=1` to use local example system as input (for debugging)
- `?last=1` to use last system successfully fetched (as fallback)
- `?anonymize=1` to anonymize all names

