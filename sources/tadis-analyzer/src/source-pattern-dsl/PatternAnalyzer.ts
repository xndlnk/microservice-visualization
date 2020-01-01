import { Injectable, Logger } from '@nestjs/common'
import * as _ from 'lodash'
import * as fs from 'fs'
import { findFilesSafe } from '../source-code-analysis/file-analysis/analysis'

import { ConfigService } from '../config/Config.service'
import { System } from '../model/ms'

// tslint:disable-next-line
import * as ms from '../model/ms'
import { Metadata } from 'src/model/core'

const logContext = 'PatternAnalyzer'
const logger = {
  log: (message: string) => Logger ? Logger.log(message, logContext) : console.log(message)
}

@Injectable()
export class PatternAnalyzer {
  constructor(
    private readonly config: ConfigService
  ) { }

  public async transformByPattern(system: System, systemPattern: SystemPattern): Promise<System> {
    replaceVariablesInPatterns(systemPattern, this.config.getSourceFolder())
    await transformByPatternInPath(system, systemPattern, this.config.getSourceFolder())
    return system
  }
}

export type SystemPattern = {
  servicePatterns: NodePattern[]
  edgePatterns: EdgePattern[]
}

export type NodePattern = {
  searchTextLocation: SearchTextLocation
  regExp: string
  capturingGroupIndexForNodeName: number
  nodeType: string
  nameResolution?: NameResolution
}

/**
 * a name resolution translates a node name that represents a variable to its value.
 * the value is discovered by another regular expression applied to the current file.
 */
export type NameResolution = {
  searchTextLocation: SearchTextLocation
  regExp: string // $name can be used to refer to the node name discovered before
}

export enum SearchTextLocation {
  FILE_PATH,
  FILE_CONTENT // content of file in current file path
}

/**
 * tries to match the source node pattern first.
 * then continues from the current file to match the target node pattern.
 */
export type EdgePattern = {
  sourceNodePattern: NodePattern
  targetNodePattern: NodePattern
  edgeType: string
}

function replaceVariablesInPatterns(systemPattern: SystemPattern, sourceFolder: string) {
  // TODO: make immutable
  systemPattern.servicePatterns
    .forEach(pattern => {
      pattern.regExp = replaceVariablesInRegExp(pattern.regExp, sourceFolder)
      if (pattern.nameResolution) {
        pattern.nameResolution.regExp = replaceVariablesInRegExp(pattern.nameResolution.regExp, sourceFolder)
      }
    })
  systemPattern.edgePatterns
    .forEach(pattern => {
      pattern.sourceNodePattern.regExp = replaceVariablesInRegExp(pattern.sourceNodePattern.regExp, sourceFolder)
      pattern.targetNodePattern.regExp = replaceVariablesInRegExp(pattern.targetNodePattern.regExp, sourceFolder)
    })
}

function replaceVariablesInRegExp(regExp: string, sourceFolder: string) {
  return regExp.replace('$sourceRoot', sourceFolder)
}

async function transformByPatternInPath(system: System, systemPattern: SystemPattern, sourceFolder: string) {
  logger.log('scanning all files in ' + sourceFolder)
  const allFiles = await findFilesSafe(sourceFolder, null)
  logger.log('found ' + allFiles.length + ' files')

  allFiles.forEach(filePath => {
    systemPattern.servicePatterns.forEach(servicePattern => {
      const nodeNames = findNodeName(servicePattern, filePath)
      if (nodeNames.length === 0) return

      for (const nodeName of nodeNames) {
        system.addOrExtendTypedNode(servicePattern.nodeType, nodeName)
        logger.log(`added node '${nodeName}'`)
      }
    })

    systemPattern.edgePatterns.forEach(edgePattern => transformByEdgePattern(system, edgePattern, filePath))
  })
}

function transformByEdgePattern(system: System, edgePattern: EdgePattern, filePath: string) {
  const sourceNodeNames = findNodeName(edgePattern.sourceNodePattern, filePath)
  if (sourceNodeNames.length === 0) return

  for (const sourceNodeName of sourceNodeNames) {
    logger.log(`found source node '${sourceNodeName}'`)

    const targetNodeNames = findNodeName(edgePattern.targetNodePattern, filePath)
    if (targetNodeNames.length === 0) return

    for (const targetNodeName of targetNodeNames) {
      logger.log(`found target node '${targetNodeName}'`)

      createEdge(system, edgePattern, sourceNodeName, targetNodeName)
    }
  }
}

function createEdge(system: System, edgePattern: EdgePattern, sourceNodeName: string, targetNodeName: string) {
  const metadata: Metadata = {
    transformer: PatternAnalyzer.name,
    context: `edge pattern with source node '${sourceNodeName}'`,
    info: `matched target node '${targetNodeName}'`
  }

  const sourceNode = system.addOrExtendTypedNode(edgePattern.sourceNodePattern.nodeType,
    sourceNodeName, null, metadata)

  const targetNode = system.addOrExtendTypedNode(edgePattern.targetNodePattern.nodeType,
    targetNodeName, null, metadata)

  const edge = new ms[edgePattern.edgeType](sourceNode, targetNode, undefined, metadata)
  system.edges.push(edge)

  logger.log(`added edge '${sourceNodeName}' --(${edgePattern.edgeType})--> '${targetNodeName}'`)
}

function findNodeName(pattern: NodePattern, filePath: string): string[] {
  const nodeNames = matchNodeName(pattern, filePath)
  if (!pattern.nameResolution) return nodeNames

  return nodeNames.map(nodeName => resolveNodeName(nodeName, pattern.nameResolution, filePath))
}

function resolveNodeName(nodeName: string, nameResolution: NameResolution, filePath: string): string {
  const regExp = nameResolution.regExp.replace('$name', nodeName)
  if (nameResolution.searchTextLocation === SearchTextLocation.FILE_CONTENT) {
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const resolvedNodeNames = matchNodeNameByRegExp(regExp, fileContent, 1)
    if (resolvedNodeNames.length === 1) {
      return resolvedNodeNames[0]
    }
  }
  return null
}

function matchNodeName(pattern: NodePattern, filePath: string): string[] {
  if (pattern.searchTextLocation === SearchTextLocation.FILE_PATH) {
    return matchNodeNameByNodePattern(pattern, filePath)
  }
  if (pattern.searchTextLocation === SearchTextLocation.FILE_CONTENT) {
    const fileContent = fs.readFileSync(filePath, 'utf8')
    return matchNodeNameByNodePattern(pattern, fileContent)
  }
  return []
}

function matchNodeNameByNodePattern(pattern: NodePattern, searchText: string): string[] {
  return matchNodeNameByRegExp(pattern.regExp, searchText, pattern.capturingGroupIndexForNodeName)
}

function matchNodeNameByRegExp(regExpString: string, searchText: string,
  capturingGroupIndexForNodeName: number
): string[] {
  const regExp = new RegExp(regExpString, 'g')
  return getAllPatternMatches<string>(regExp, searchText,
    (matchArray: RegExpExecArray) => {
      if (matchArray.length >= capturingGroupIndexForNodeName) {
        return matchArray[capturingGroupIndexForNodeName]
      }
      return null
    })
}

function getAllPatternMatches<MatchType>(pattern: RegExp, content: string,
  matchTransformer: ((matchArray: RegExpExecArray) => MatchType | null)): MatchType[] {
  const allMatches: MatchType[] = []

  let matches = pattern.exec(content)
  while (matches != null) {
    const capturedValue = matchTransformer(matches)
    if (capturedValue) {
      allMatches.push(capturedValue)
    }
    matches = pattern.exec(content)
  }

  return allMatches
}
