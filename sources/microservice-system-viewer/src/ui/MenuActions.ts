import * as d3 from 'd3'

export class MenuActions {
  install() {
    this.registerMenuHandlers()
  }

  registerMenuHandlers() {
    d3.select('#info-link').on('click', () => {
      const infoElement = d3.select('#info')
      const currentDisplay = infoElement.style('display')
      infoElement.style('display', currentDisplay === 'none' ? 'block' : 'none')
    })
  }
}
