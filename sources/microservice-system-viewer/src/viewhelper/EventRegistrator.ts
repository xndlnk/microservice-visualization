import { ScrollHandler } from './ScrollHandler'
import { SvgEdgeHighlightning } from './SvgEdgeHighlightning'

export class EventRegistrator {

  /**
   * Initiates all necessary events
   */
  public static init(): void {
    for (let element of this.getEdges().values()) {
      element.addEventListener('click', ScrollHandler.handler)
      element.addEventListener('mouseover', SvgEdgeHighlightning.markAsHighlightedHandler)
      element.addEventListener('mouseout', SvgEdgeHighlightning.markAsNotHighlightedHandler)
    }
  }

  private static getEdges(): NodeListOf<Element> {
    return document.querySelectorAll('g.edge>polygon,g.edge>ellipse')
  }
}
