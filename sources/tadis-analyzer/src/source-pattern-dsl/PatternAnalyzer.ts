import { Injectable, Logger } from '@nestjs/common'
import * as _ from 'lodash'
import * as fs from 'fs'
import * as immer from 'immer'

import { findFilesSafe } from '../source-code-analysis/file-analysis/analysis'
import { ConfigService } from '../config/Config.service'
import { System } from '../model/ms'
import { SystemPattern, NodePattern, EdgePattern, NameResolution, SearchTextLocation } from './model'
export { SystemPattern, NodePattern, EdgePattern, NameResolution, SearchTextLocation } from './model'

// tslint:disable-next-line
import * as ms from '../model/ms'
import { Metadata } from 'src/model/core'

const logContext = 'PatternAnalyzer'
const logger = {
  log: (message: string) => Logger ? Logger.log(message, logContext) : console.log(message)
}

/**
 * The PatternAnalyzer allows to derive a system from source code patterns defined by regular expressions.
 */
@Injectable()
export class PatternAnalyzer {
  constructor(
    private readonly config: ConfigService
  ) { }

  public async transform(system: System, systemPattern: SystemPattern): Promise<System> {
    const systemPatternWithoutVariables = replaceVariablesInPatterns(systemPattern, this.config.getSourceFolder())
    await transformByPatternInPath(system, systemPatternWithoutVariables, this.config.getSourceFolder())
    return system
  }
}

function replaceVariablesInPatterns(systemPattern: SystemPattern, sourceFolder: string): SystemPattern {
  return immer.produce(systemPattern, (systemPatternDraft) => {
    systemPatternDraft.nodePatterns
      .forEach(pattern => {
        pattern.regExp = replaceVariablesInRegExp(pattern.regExp, sourceFolder)
        if (pattern.nameResolution) {
          pattern.nameResolution.regExp = replaceVariablesInRegExp(pattern.nameResolution.regExp, sourceFolder)
        }
      })

    systemPatternDraft.edgePatterns
      .forEach(pattern => {
        pattern.sourceNodePattern.regExp = replaceVariablesInRegExp(pattern.sourceNodePattern.regExp, sourceFolder)
        pattern.targetNodePattern.regExp = replaceVariablesInRegExp(pattern.targetNodePattern.regExp, sourceFolder)
      })
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
    systemPattern.nodePatterns.forEach(servicePattern => {
      findNodeNames(servicePattern, filePath).forEach(nodeName => {
        system.addOrExtendTypedNode(servicePattern.nodeType, nodeName)
        logger.log(`added node '${nodeName}'`)
      })
    })

    systemPattern.edgePatterns.forEach(edgePattern => transformByEdgePattern(system, edgePattern, filePath))
  })
}

function transformByEdgePattern(system: System, edgePattern: EdgePattern, filePath: string) {
  findNodeNames(edgePattern.sourceNodePattern, filePath)
    .forEach(sourceNodeName => {
      logger.log(`found source node '${sourceNodeName}'`)

      findNodeNames(edgePattern.targetNodePattern, filePath)
        .forEach(targetNodeName => {
          logger.log(`found target node '${targetNodeName}'`)
          createEdge(system, edgePattern, sourceNodeName, targetNodeName)
        })
    })
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

function findNodeNames(pattern: NodePattern, filePath: string): string[] {
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
