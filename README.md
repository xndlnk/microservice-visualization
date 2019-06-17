# Microservice Visualization with TADIS - a Tool for Architecture Discovery

[![Build Status](https://travis-ci.org/MaibornWolff/microservice-visualization.svg?branch=master)](https://travis-ci.org/MaibornWolff/microservice-visualization) 
![Hex.pm](https://img.shields.io/hexpm/l/plug.svg)
[![Automated Release Notes by gren](https://img.shields.io/badge/%F0%9F%A4%96-release%20notes-00B2EE.svg)](https://github-tools.github.io/github-release-notes/)

This repository contains software for analyzing and visualizing the topology of a microservice system.

## Repository structure

The repository is organized as a mono-repo with Yarn and Lerna. Each directory in `sources` is a Yarn workspace.

- [tadis-analyzer](sources/tadis-analyzer) - analyzer backend
- [tadis-analyzer-custom-example](sources/tadis-analyzer-custom-example) - example customization of tadis-analyzer
- [tadis-ui](sources/tadis-ui) - web-frontend based on D3 and Graphviz
- [microservice-system-analyzer](sources/microservice-system-analyzer) - deprecated analyzer backend that is currently replaced by tadis-analyzer

## Setup

1. You need a global installation of the following:
  - [Node.js v10](https://nodejs.org),
  - [Yarn](https://yarnpkg.com),
  - [Lerna](https://github.com/lerna/lerna),
2. Bootstrap the node package structure with `yarn install`.

## License

[Apache License, Version 2.0](LICENSE)

Copyright 2017-2018 Andreas Blunk, MaibornWolff GmbH