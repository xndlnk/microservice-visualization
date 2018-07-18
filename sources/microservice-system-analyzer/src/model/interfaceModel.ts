export interface INode {
  id: string
  name: string
  nodes?: INode[]
  edges?: IEdge[]
  properties?: IProperties
  type: string
}

export interface IEdge {
  sourceId: string
  targetId: string
  properties?: IProperties
  type: string
}

export interface IProperties {
  [key: string]: any
}
