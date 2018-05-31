# microservice-visualization

[![Build Status](https://travis-ci.org/xndlnk/microservice-visualization.svg?branch=master)](https://travis-ci.org/xndlnk/microservice-visualization)

This repository contains software for analyzing and visualizing the topology of a microservice system.

## Repository structure

The repository is organized as a mono-repo where each directory in `sources` is a yarn workspace.

- [microservice-system-analyzer](sources/microservice-system-analyzer) is a NPM library for analyzing microservice systems

## Setup

- on a fresh clone, bootstrap the node package structure first: `yarn install`

## Publishing a new version

- commit changes with git
- publish changes with lerna: `lerna publish`

## General requirements

- node 8
- yarn
- lerna

## License

[Apache License, Version 2.0](LICENSE)

Copyright 2017-2018 Andreas Blunk, MaibornWolff GmbH