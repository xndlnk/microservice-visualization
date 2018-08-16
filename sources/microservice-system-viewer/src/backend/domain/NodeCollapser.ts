import { Node, Edge } from './model'

export class NodeCollapser {

  collapseContainedNodes(graph: Node): Node {
    if (graph.hasEdges()) {
      let redirectedEdges = graph.getEdges()
        .map(edge => this.getInsideEdgesRedirectedToTopLevelNodes(graph, edge))

      let collapsedNodes = graph.getNodes()
        .map(node => {
          let nodeCopy = JSON.parse(JSON.stringify(node))
          return new Node(nodeCopy.id, nodeCopy.name, nodeCopy.type, [], [], nodeCopy.properties)
        })

      let graphCopy = JSON.parse(JSON.stringify(graph))
      return new Node(graphCopy.id, graphCopy.name, graphCopy.type, collapsedNodes, redirectedEdges, graphCopy.properties)
    } else {
      return graph
    }
  }

  getInsideEdgesRedirectedToTopLevelNodes(graph: Node, edge: Edge): Edge {
    let sourceId: string = edge.sourceId
    if (!graph.getNodes().find(node => node.id === edge.sourceId)) {
      sourceId = this.getTopLevelParentInGraph(graph, edge.sourceId).id
    }
    let targetId: string = edge.targetId
    if (!graph.getNodes().find(node => node.id === edge.targetId)) {
      targetId = this.getTopLevelParentInGraph(graph, edge.targetId).id
    }
    return new Edge(sourceId, targetId, edge.type)
  }

  getTopLevelParentInGraph(graph: Node, searchedNodeId: string): Node {
    let topNode = graph.getNodes().find(node => this.isTopLevelParent(node, searchedNodeId))
    return topNode ? topNode : null
  }

  private isTopLevelParent(currentNode: Node, searchedNodeId: string): boolean {
    if (currentNode.getNodes().some(childNode => childNode.id === searchedNodeId)) {
      return true
    } else {
      return currentNode.getNodes().some(childNode => this.isTopLevelParent(childNode, searchedNodeId))
    }
  }
}
