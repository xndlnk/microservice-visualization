import * as express from 'express'
import * as path from 'path'
import * as dotenv from 'dotenv'
import * as envYaml from './envYamlString'
import { SystemToDotConverter, Options as ConverterOptions } from './domain/systemToDot'
import { Node } from './domain/model'
import { appBaseUrl } from './appBaseUrl'
import { SystemProvider } from './systemProvider/SystemProvider'
import { SystemFetcher } from './systemProvider/SystemFetcher'
import { ConsulAnalyzerServiceResolver } from './systemProvider/ConsulAnalyzerServiceResolver'
import { GraphInteractions } from './domain/GraphInteractions'
import { SecondLevelEdgesRemover } from './domain/SecondLevelEdgesRemover'
import vizJs = require('viz.js')

dotenv.config()
envYaml.config()

const views: any = process.env.views ? JSON.parse(process.env.views) : {}

const app = express()

const htmlDir = path.join(process.cwd(), 'src', 'html')
const bundleDir = path.join(process.cwd(), 'build', 'bundle')

app.use(`${appBaseUrl}/html`, express.static(htmlDir))
app.use(`${appBaseUrl}/html`, express.static(bundleDir))

if (isProduction()) {
  console.log('running in production mode')
}

addRestHandlers(app)

const PORT = process.env.PORT || 8080
app.listen(PORT)
console.log('running on http://localhost:' + PORT)

function addRestHandlers(app: express.Express) {
  // TODO: move these calls to a central system provider
  const systemFetcher = new SystemFetcher(process.env.SYSTEM_PROVIDER_URL, getAnalyzerServiceResolver())
  const systemProvider = new SystemProvider(systemFetcher)

  // TODO: allow to clear the cached system

  app.get(`${appBaseUrl}/system`, (req, res) => {
    systemProvider.getSystem(req.query).then(system => {
      if (system) {
        if (req.query.focusId) {
          system = GraphInteractions.focusNode(system, req.query.focusId)
        }
        if (req.query.collapse) {
          system = GraphInteractions.collapseNode(system)
        }
        if (req.query.collapse2) {
          system = new SecondLevelEdgesRemover().transformer(system)
        }
        let options: ConverterOptions = {
          urlExtractor: (node: Node) => node.getProp('url', null)
        }

        if (req.query.interactive) {
          options = {
            urlExtractor: (node: Node) => {
              req.query.focusId = node.id
              return '?' + Object.getOwnPropertyNames(req.query)
                .map(propName => propName + '=' + req.query[propName])
                .join('&')
            }
          }
        }
        // const dotSystem = new SystemToDotConverter(options).convertSystemToDot(system)
        // const svgSystem = vizJs(dotSystem, { format: 'svg', engine: 'dot' })
        res.send(system)
      } else {
        res.send(systemProvider.getMessageForFallbackToLastFetchedSystem(req))
      }
    })
    .catch(error => {
      res.send('an error occured: ' + error)
    })
  })

  app.get('/', (req, res) => {
    const endpoints = app._router.stack
    .filter((element) => element.route && element.route.path)
    .map((element) => {
      let method = ''
      if (element.route.stack[0].method) {
        method = element.route.stack[0].method.toUpperCase()
      }
      return { 'path': element.route.path, 'method': method }
    })

    const endpointHtml = endpoints.map(endpoint => `${endpoint.method}: <a href="${endpoint.path}">${endpoint.path}</a>`).join('<br/>')

    res.send(`<h1>API</h1>${endpointHtml}`)
  })
}

function getAnalyzerServiceResolver() {
  if (process.env.CONSUL_BASE_URL
      && process.env.SYSTEM_PROVIDER_SERVICE_NAME
      && process.env.SYSTEM_PROVIDER_SERVICE_ENDPOINT) {
    return new ConsulAnalyzerServiceResolver(
      process.env.CONSUL_BASE_URL,
      process.env.SYSTEM_PROVIDER_SERVICE_NAME,
      process.env.SYSTEM_PROVIDER_SERVICE_ENDPOINT)
  }
  return null
}

function isProduction() {
  return process.env.NODE_ENV && process.env.NODE_ENV === 'production'
}
