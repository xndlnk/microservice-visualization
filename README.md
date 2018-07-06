# microservice-visualization

[![Build Status](https://travis-ci.org/MaibornWolff/microservice-visualization.svg?branch=master)](https://travis-ci.org/MaibornWolff/microservice-visualization) 
![Hex.pm](https://img.shields.io/hexpm/l/plug.svg)

This repository contains software for analyzing and visualizing the topology of a microservice system.

## Repository structure

The repository is organized as a mono-repo where each directory in `sources` is a yarn workspace.

- [microservice-system-analyzer](sources/microservice-system-analyzer) is a Node.js library for analyzing microservice systems
- [microservice-system-viewer](sources/microservice-system-viewer) is a Docker-based microservice for visualizing systems which are analyzed by the microservice-system-analyzer in a web-based frontend

## Setup

- first, you need a global installation of the following packages:
  - Node.js 8
  - yarn
  - lerna
- after that, bootstrap the node package structure with `yarn install`

## Publishing a new version

- commit changes
- execute `npm run publish` to build distribution libraries and publish

## License

[Apache License, Version 2.0](LICENSE)

Copyright 2017-2018 Andreas Blunk, MaibornWolff GmbH