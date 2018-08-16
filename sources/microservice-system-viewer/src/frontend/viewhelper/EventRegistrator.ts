import { ScrollHandler } from './ScrollHandler'
import { SvgEdgeHighlightning } from './SvgEdgeHighlightning'

export class EventRegistrator {

  private static shiftPressed: boolean = false

  /**
   * Initiates all necessary events
   */
  public static init(): void {
    for (let element of this.getEdges().values()) {
      element.addEventListener('click', ScrollHandler.handler)
      element.addEventListener('mouseover', SvgEdgeHighlightning.markAsHighlightedHandler)
      element.addEventListener('mouseout', SvgEdgeHighlightning.markAsNotHighlightedHandler)
    }

    for (let element of this.getNodesWithLinks().values()) {
      const cssHighlightClass: string = 'highlight'
      element.addEventListener('mouseover', (e: MouseEvent) => {
        if (EventRegistrator.shiftPressed) {
          const parentNode = e.srcElement.parentElement.parentElement.parentElement
          parentNode.classList.add(cssHighlightClass)
        }
      })
      element.addEventListener('mouseout', (e: MouseEvent) => {
        const parentNode = e.srcElement.parentElement.parentElement.parentElement
        parentNode.classList.remove(cssHighlightClass)
      })
      element.addEventListener('click',
        (event: Event) => {
          if (EventRegistrator.shiftPressed) {
            EventRegistrator.shiftPressed = false
            console.log('focus!')
          }
        })
    }

    window.onkeydown = (ev: KeyboardEvent) => {
      EventRegistrator.shiftPressed = ev.shiftKey
      console.log(EventRegistrator.shiftPressed)
    }

    window.onkeyup = (ev: KeyboardEvent) => {
      EventRegistrator.shiftPressed = ev.shiftKey
      console.log(EventRegistrator.shiftPressed)
    }
  }

  private static getEdges(): NodeListOf<Element> {
    return document.querySelectorAll('g.edge>polygon,g.edge>ellipse')
  }

  private static getNodesWithLinks(): NodeListOf<Element> {
    return document.querySelectorAll('g.node>g>a>polygon') // ,g.node>polygon,g.node>text
  }
}
