import * as axios from 'axios'
import { appBaseUrl } from '../appBaseUrl'

const svgSystemUrl = getBaseUrlInCurrentEnvironment() + '/svg/wikilinks'
console.log('fetching svg system from url ' + svgSystemUrl)

// can also use: axios.defaults.baseURL
axios.default
  .get(svgSystemUrl)
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

function append(svgSystem) {
  let element: HTMLElement = document.createElement('div')

  if (svgSystem) {
    element.innerHTML = svgSystem
  } else {
    element.innerHTML = 'no system found'
  }

  document.body.appendChild(element)
}
