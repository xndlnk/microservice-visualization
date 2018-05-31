## Local development

For local development, a local NPM registry can be helpful.

- make sure that local npm registry is used: `npm set registry http://localhost:4873/`
- login to npm registry: `npm adduser --registry http://localhost:4873`
- run npm registry: `verdaccio`
- publish as described above
