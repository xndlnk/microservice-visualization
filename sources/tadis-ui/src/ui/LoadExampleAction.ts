import * as d3 from 'd3'

import { system as rawSystem } from '../exampleSystems/simpleSystem'
import { Node } from '../domain/model'
import { Options as SystemToDotOptions } from '../domain/systemToDot'

export class LoadExampleAction {
  install(displaySystem: (Node, SystemToDotOptions) => void) {
    this.registerHandlers(displaySystem)
  }

  registerHandlers(displaySystem: (Node, SystemToDotOptions) => void) {
    d3.select('#load-example-link').on('click', () => {
      const system = Node.ofRawNode(rawSystem)
      const options: SystemToDotOptions = {
        urlExtractor: (node: Node) => ''
      }
      displaySystem(system, options)
    })
  }
}
