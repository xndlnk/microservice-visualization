export interface Node {
  name: string
  nodes: Node[]
  edges: Edge[]
  properties: Properties
  type: string
}

export interface Edge {
  source: Node
  target: Node
  sourceId: string
  targetId: string
  type: string
  properties: Properties
}

export interface Properties {
  [key: string]: any
}
