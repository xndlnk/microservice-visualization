const CLASS_NAME: string = 'highlight'
export class SvgEdgeHighlightning {

  static markAsHighlightedHandler(e: MouseEvent) {
    e.srcElement.parentElement.classList.add(CLASS_NAME)
    console.log(e.srcElement.parentElement.classList)
  }

  static markAsNotHighlightedHandler(e: MouseEvent) {
    e.srcElement.parentElement.classList.remove(CLASS_NAME)
  }
}
