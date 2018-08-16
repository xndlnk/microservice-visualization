const CLASS_NAME: string = 'highlight'
export class SvgEdgeHighlightning {

  static markAsHighlightedHandler(e: MouseEvent) {
    e.srcElement.parentElement.classList.add(CLASS_NAME)
  }

  static markAsNotHighlightedHandler(e: MouseEvent) {
    e.srcElement.parentElement.classList.remove(CLASS_NAME)
  }
}
