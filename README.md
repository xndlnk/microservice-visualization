# microservice-visualization

This repository contains software for analyzing and visualizing the topology of microservice systems.

## Repository structure

The repository is organized as a mono-repo where each directory in `sources` is a yarn workspace.

- [microservice-system-analyzer](sources/microservice-system-analyzer) is a NPM library for analyzing microservice systems

## Setup

- on a fresh clone, bootstrap the node package structure first: `yarn install`

## Publishing a new version

- commit changes with git
- publish changes with lerna: `lerna publish`

## Local development

For local development, a local NPM registry can be used.

- make sure that local npm registry is used: `npm set registry http://localhost:4873/`
- login to npm registry: `npm adduser --registry http://localhost:4873`
- run npm registry: `verdaccio`
- publish as described above

## General requirements

- node 8
- yarn
- lerna

## License

[Apache License, Version 2.0](LICENSE)

Copyright 2017-2018 Andreas Blunk, MaibornWolff GmbH