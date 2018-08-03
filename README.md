# microservice-visualization

[![Build Status](https://travis-ci.org/MaibornWolff/microservice-visualization.svg?branch=master)](https://travis-ci.org/MaibornWolff/microservice-visualization) 
![Hex.pm](https://img.shields.io/hexpm/l/plug.svg)

This repository contains software for analyzing and visualizing the topology of a microservice system.

## Repository structure

The repository is organized as a mono-repo with Yarn and Lerna. Each directory in `sources` is a Yarn workspace.

- [microservice-system-analyzer](sources/microservice-system-analyzer) - a Node.js library for analyzing microservice systems
- [microservice-system-viewer](sources/microservice-system-viewer) - a Docker-based microservice for visualizing systems in a web browser

## Setup

- You need a global installation of the following:
  - Node.js v8,
  - Yarn,
  - Lerna.
- After that, bootstrap the node package structure with `yarn install`.

## Publishing a new version

- commit changes
- execute `npm run publish` to build distribution libraries and publish

## License

[Apache License, Version 2.0](LICENSE)

Copyright 2017-2018 Andreas Blunk, MaibornWolff GmbH