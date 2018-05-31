# system-visualization

The system-visualization repository contains different NPM packages for analyzing and visualizing the structure of large systems.

## Project structure

The project is organized as a mono-repo where each directory in `sources` is a yarn workspace.

- [system-structure-analyzer](sources/system-structure-analyzer) is a library for analyzing microservice systems

## Setup

- on a fresh clone, bootstrap the node package structure first: `yarn install`

## Publishing a new version

- commit changes with git
- publish changes with lerna: `lerna publish`

## Local development

For local development, a local NPM registry should be used.

- make sure that local npm registry is used: `npm set registry http://localhost:4873/`
- login to npm registry: `npm adduser --registry http://localhost:4873`
- run npm registry: `verdaccio`
- publish as described above

## General requirements

- node 8
- yarn
- lerna