import * as axios from 'axios'
import { appBaseUrl } from '../appBaseUrl'
import vizJs = require('viz.js')

const dotSystemUrl = getBaseUrlInCurrentEnvironment() + '/dot'
console.log('fetching dot system from url ' + dotSystemUrl)

// DEPRECATED: this an old index.ts that is not used anymore.
// it just shows how vizjs can be used in the frontend.

// can also use: axios.defaults.baseURL
axios.default
  .get(dotSystemUrl)
  .then(function(response) {
    append(response.data)
  })
  .catch(function(error) {
    let element: HTMLElement = document.createElement('div')
    element.innerHTML = error
    document.body.appendChild(element)
  })

function getBaseUrlInCurrentEnvironment() {
  let appBaseUrlStart = window.location.href.lastIndexOf(appBaseUrl)
  if (appBaseUrlStart === -1) {
    return appBaseUrlStart
  } else {
    return window.location.href.substring(0, appBaseUrlStart) + appBaseUrl
  }
}

function append(dotSystem) {
  let element: HTMLElement = document.createElement('div')

  if (dotSystem) {
    console.log(dotSystem)
    const svg = vizJs(dotSystem, { format: 'svg', engine: 'dot' })
    element.innerHTML = svg
  } else {
    element.innerHTML = 'no system found'
  }

  document.body.appendChild(element)
}
