import * as _ from 'lodash'

// INFO: this model will replace the old one in modelClasses.js

export interface Element {
  getProperties(): Properties
  addProperty(name: string, value: any)
}

export interface Properties {
  [key: string]: any
}

export interface Node extends Element {
  getId(): string
  getNodes(): Node[]
  getEdges(): Edge[]
  deepFindNodeById(id: string): Node
}

export interface Edge extends Element {
  getSource(): Node
  getTarget(): Node
}
