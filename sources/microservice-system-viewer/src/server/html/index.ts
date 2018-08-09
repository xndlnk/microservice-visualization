import * as axios from 'axios'
import { appBaseUrl } from '../appBaseUrl'
import { EventRegistrator } from './viewhelper/EventRegistrator'

const queryPart = window.location.href.substr(window.location.href.lastIndexOf('?'))
const svgSystemUrl = getBaseUrlInCurrentEnvironment() + '/system' + queryPart
console.log('fetching svg system from url ' + svgSystemUrl)

// can also use: axios.defaults.baseURL
axios.default
  .get(svgSystemUrl)
  .then(function(response) {
      // INFO: keeping the state in the backend is not ideal. it would be much better to use react.
      // then each user keeps his own state and can operate on it.
      // however, the backend solution is the one that we can implement the fastest right now
      // in order to allow graph navigation.
    append(response.data)
    EventRegistrator.init()
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
