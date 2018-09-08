# microservice-visualization

[![Build Status](https://travis-ci.org/MaibornWolff/microservice-visualization.svg?branch=master)](https://travis-ci.org/MaibornWolff/microservice-visualization) 
![Hex.pm](https://img.shields.io/hexpm/l/plug.svg)
[![Automated Release Notes by gren](https://img.shields.io/badge/%F0%9F%A4%96-release%20notes-00B2EE.svg)](https://github-tools.github.io/github-release-notes/)

This repository contains software for analyzing and visualizing the topology of a microservice system.

## Repository structure

The repository is organized as a mono-repo with Yarn and Lerna. Each directory in `sources` is a Yarn workspace.

- [microservice-system-analyzer](sources/microservice-system-analyzer) - a Node.js library for analyzing microservice systems
- [microservice-system-viewer](sources/microservice-system-viewer) - a Docker-based microservice for visualizing systems in a web browser

## Setup

1. You need a global installation of the following:
  - [Node.js v8](https://nodejs.org),
  - [Yarn](https://yarnpkg.com),
  - [Lerna](https://github.com/lerna/lerna),
  - optionally [gren](https://github.com/github-tools/github-release-notes) (only if you want to create github release notes)
2. Bootstrap the node package structure with `yarn install`.

## License

[Apache License, Version 2.0](LICENSE)

Copyright 2017-2018 Andreas Blunk, MaibornWolff GmbH