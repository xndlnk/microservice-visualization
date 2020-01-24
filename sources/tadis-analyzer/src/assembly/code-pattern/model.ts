/**
 * A system pattern defines patterns from which nodes and edges are derived.
 * special variables allowed in all regExp attributes:
 * - $sourceRoot holds the location of the configured source folder
 */
export type SystemPattern = {
  nodePatterns: NodePattern[]
  edgePatterns: EdgePattern[]
}

export type NodePattern = NamePattern & {
  /**
   * the class name of the node to create. this class must exist in model/ms.ts
   * @see ../model/ms.ts
   */
  nodeType: string
}

export type NamePattern = {
  /**
   * location of the search text that is used for matching the regular expression.
   */
  searchTextLocation: SearchTextLocation
  /**
   * a JavaScript regular expression that defines the pattern to be matched.
   * the expression must define a capturing group from which the node name is derived.
   */
  regExp: string
  /**
   * the index of the capturing group to derive the node name from.
   */
  capturingGroupIndexForName: number
  /**
   * a name resolution translates a node name that represents a variable to its value.
   * the value is discovered by another regular expression applied to the current file.
   *
   * in this case, the provided regular expression defines a pattern from which
   * the name can be resolved.
   *
   * special variables allowed:
   *  - $name can be used to refer to the node name discovered before
   */
  nameResolutionPattern?: NamePattern
}

export enum SearchTextLocation {
  /**
   * absolute path of the source code file under analysis
   */
  FILE_PATH,
  /**
   * content of the source code file under analysis
   */
  FILE_CONTENT,
  /**
   * the content of any file in the source code folder
   */
  ANY_FILE_CONTENT
}

/**
 * defines patterns of source and target nodes from which the nodes and edges
 * connecting them are derived. the source node pattern must match first.
 * next, the target node pattern is matched for each derived source node.
 */
export type EdgePattern = {
  sourceNodePattern: NodePattern
  targetNodePattern: NodePattern
  edgeType: string
}
