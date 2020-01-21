import { Node } from '../model/core'
import './expect-extensions'

export function verifyEachContentHasFields(node: Node, fields: any) {
  expect(node.nodes.map(node => node.content)).toContainObject(fields)
  expect(node.edges.map(edge => edge.content)).toContainObject(fields)
}

export function verifyEachContentHasTransformer(node: Node, transformer: string) {
  if (node.nodes && node.nodes.length > 0) {
    expect(node.nodes.map(node => node.content.metadata)).toContainObject({ transformer })
  }

  if (node.edges && node.edges.length > 0) {
    expect(node.edges.map(edge => edge.content?.metadata)).toContainObject({ transformer })
  }
}
