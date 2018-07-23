import {ScrollHandler} from './ScrollHandler'
import {SvgEdgeHighlightning} from './SvgEdgeHighlightning'

export class EventRegistrator {

  /**
   * Initiates all necessary events
   */
  public static init(): void {
    for (let node of this.getRelevantNodes().values()) {
      node.addEventListener('click', ScrollHandler.handler)
      node.addEventListener('mouseover', SvgEdgeHighlightning.markAsHighlightedHandler)
      node.addEventListener('mouseout', SvgEdgeHighlightning.markAsNotHighlightedHandler)
    }
  }

  /**
   * @returns {NodeListOf<Element>}
   */
  private static getRelevantNodes(): NodeListOf<Element> {
    return document.querySelectorAll('g.edge>polygon,g.edge>ellipse')
  }
}
