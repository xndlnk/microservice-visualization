import * as d3 from 'd3'

import { system as rawSystem } from '../exampleSystems/simpleSystem'

export class LoadExampleAction {
  install(displaySystem: (INode) => void) {
    this.registerHandlers(displaySystem)
  }

  registerHandlers(displaySystem: (INode) => void) {
    d3.select('#load-example-link').on('click', () => {
      displaySystem(rawSystem)
    })
  }
}
