import * as fs from 'fs'
import * as path from 'path'
import * as _ from 'lodash'
import * as immer from 'immer'
import { findFilesSafe } from '../../source-code-analysis/file-analysis/analysis'
import { SystemPattern, NodePattern, EdgePattern, SearchTextLocation, NamePattern } from './model'
import { Logger } from '@nestjs/common'
import { System } from '../../model/ms'

// tslint:disable-next-line
import * as ms from '../../model/ms'

import { Metadata } from '../../model/core'
import { number } from 'joi'
import { ContextCreator } from '@nestjs/core/helpers/context-creator'

/**
 * The PatternAnalyzer allows to derive a system from source code patterns defined by regular expressions.
 */
export class PatternAnalyzer {
  constructor(
    public readonly sourceFolder: string
  ) { }

  public async transform(system: System, systemPattern: SystemPattern): Promise<System> {
    const systemPatternWithoutVariables = replaceVariablesInPatterns(systemPattern, this.sourceFolder)
    await transformByPatternInPath(system, systemPatternWithoutVariables, this.sourceFolder)
    return system
  }
}

function replaceVariablesInPatterns(systemPattern: SystemPattern, sourceFolder: string): SystemPattern {
  return immer.produce(systemPattern, (systemPatternDraft) => {
    systemPatternDraft.nodePatterns
      .forEach(pattern => {
        pattern.regExp = replaceVariablesInRegExp(pattern.regExp, sourceFolder)
        if (pattern.nameResolutionPattern) {
          pattern.nameResolutionPattern.regExp = replaceVariablesInRegExp(pattern.nameResolutionPattern.regExp, sourceFolder)
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
  return regExp.replace('$sourceRoot', path.resolve(sourceFolder))
}

async function transformByPatternInPath(system: System, systemPattern: SystemPattern, sourceFolder: string) {
  Logger.log('scanning all files in ' + sourceFolder)
  const allFiles = await findFilesSafe(sourceFolder, undefined)
  Logger.log('found ' + allFiles.length + ' files')

  allFiles.forEach(filePath => {
    systemPattern.nodePatterns.forEach(servicePattern => {
      findNodeNames(servicePattern, filePath, allFiles).forEach(nodeName => {
        system.addOrExtendTypedNode(servicePattern.nodeType, nodeName)
        Logger.log(`added node '${nodeName}'`)
      })
    })

    systemPattern.edgePatterns
      .forEach(edgePattern => transformByEdgePattern(system, edgePattern, filePath, allFiles))
  })
}

function transformByEdgePattern(system: System, edgePattern: EdgePattern, filePath: string,
  allFiles: string[]) {
  findNodeNames(edgePattern.sourceNodePattern, filePath, allFiles)
    .forEach(sourceNodeName => {
      Logger.log(`found source node '${sourceNodeName}'`)

      findNodeNames(edgePattern.targetNodePattern, filePath, allFiles)
        .forEach(targetNodeName => {
          Logger.log(`found target node '${targetNodeName}'`)
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

  Logger.log(`added edge '${sourceNodeName}' --(${edgePattern.edgeType})--> '${targetNodeName}'`)
}

function findNodeNames(pattern: NodePattern, filePath: string, allFiles: string[]): string[] {
  const nodeNames = matchNodeName(pattern, filePath)

  if (!pattern.nameResolutionPattern) return nodeNames
  const nameResolution = pattern.nameResolutionPattern

  return nodeNames.map(nodeName => resolveNodeName(nodeName, nameResolution, filePath, allFiles))
}

interface Content {
  read(): string
}

class FileContent implements Content {
  constructor(private readonly file: string) {}
  read(): string {
    return fs.readFileSync(this.file, 'utf8')
  }
}

function resolveNodeName(id: string, nameResolution: NamePattern, filePath: string, allFiles: string[]): string {
  const regExp = nameResolution.regExp.replace('$name', id)

  const contents = getContentsToResolveNodeNameFrom(nameResolution, filePath, allFiles)
  for (const content of contents) {
    const resolvedNodeNames = matchNodeNameByRegExp(regExp, content.read(), 1)
    if (resolvedNodeNames.length === 1) {
      const resolvedName = resolvedNodeNames[0]
      if (!nameResolution.nameResolutionPattern) {
        return resolvedName
      }
      return this.resolveNodeName(resolvedName, nameResolution.nameResolutionPattern, filePath, allFiles)
    }
  }
  return id
}

function getContentsToResolveNodeNameFrom(nameResolution: NamePattern, filePath: string, allFiles: string[]): Content[] {
  if (nameResolution.searchTextLocation === SearchTextLocation.FILE_CONTENT) {
    return [new FileContent(filePath)]
  } else if (nameResolution.searchTextLocation === SearchTextLocation.ANY_FILE_CONTENT) {
    return allFiles.map(file => new FileContent(file))
  }
  return [{
    read: () => {
      return filePath
    }
  }]
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
  return matchNodeNameByRegExp(pattern.regExp, searchText, pattern.capturingGroupIndexForName)
}

function matchNodeNameByRegExp(regExpString: string, searchText: string,
  capturingGroupIndexForName: number
): string[] {
  const regExp = new RegExp(regExpString, 'g')
  return getAllPatternMatches<string>(regExp, searchText,
    (matchArray: RegExpExecArray) => {
      if (matchArray.length >= capturingGroupIndexForName) {
        return matchArray[capturingGroupIndexForName]
      }
      return null
    })
}

function getAllPatternMatches<MatchType>(pattern: RegExp, content: string,
  matchTransformer: ((matchArray: RegExpExecArray) => MatchType | null)): MatchType[] {
  const allMatches: MatchType[] = []

  let matches = pattern.exec(content)
  while (matches !== null) {
    const capturedValue = matchTransformer(matches)
    if (capturedValue) {
      allMatches.push(capturedValue)
    }
    matches = pattern.exec(content)
  }

  return allMatches
}
