export interface Node {
  id: string
  name: string
  nodes?: Node[]
  edges?: Edge[]
  properties?: Properties
  type: string
}

export interface Edge {
  sourceId: string
  targetId: string
  properties?: Properties
  type: string
}

export interface Properties {
  [key: string]: any
}
