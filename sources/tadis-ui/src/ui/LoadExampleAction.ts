import * as d3 from 'd3'

import { system as rawSystem } from '../exampleSystems/simpleSystem'
import { Node } from '../domain/model'

export class LoadExampleAction {
  install(displaySystem: (Node) => void) {
    this.registerHandlers(displaySystem)
  }

  registerHandlers(displaySystem: (Node) => void) {
    d3.select('#load-example-link').on('click', () => {
      const system = Node.ofRawNode(rawSystem)
      displaySystem(system)
    })
  }
}
