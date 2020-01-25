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
      findNodeNames(servicePattern, filePath, allFiles, new NameMemory()).forEach(node => {
        const nodeName = node.nodeName
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
  findNodeNames(edgePattern.sourceNodePattern, filePath, allFiles, new NameMemory())
    .forEach(sourceNode => {
      const sourceNodeName = sourceNode.nodeName
      Logger.log(`found source node '${sourceNodeName}'`)

      findNodeNames(edgePattern.targetNodePattern, filePath, allFiles, sourceNode.nameMemory)
        .forEach(targetNode => {
          const targetNodeName = targetNode.nodeName
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

class MatchedNode {
  constructor(
    public readonly nodeName: string,
    public readonly nameMemory: NameMemory
  ) {}
}

class NameMemory {
  private readonly names: Map<string,string>

  constructor(
    public readonly inheritedNameMemory?: NameMemory
  ) {
    this.names = new Map()
  }

  saveName(name: string, value: string) {
    this.names.set(name, value)
  }

  getCurrentNames(): Map<string,string> {
    return this.names
  }

  findName(name: string): string | undefined {
    const directName = this.names.get(name)
    if (!directName && this.inheritedNameMemory) return this.inheritedNameMemory.findName(name)
    return undefined
  }

  toString(): string {
    let result = ''
    for (const entry of this.names.entries()) {
      result += entry[0] + ': ' + entry[1] + '\n'
    }
    return result + (this.inheritedNameMemory ? this.inheritedNameMemory.toString() : '')
  }
}

function findNodeNames(pattern: NodePattern, filePath: string, allFiles: string[], nameMemory: NameMemory): MatchedNode[] {
  const matchedNodes = matchNodeName(pattern, filePath, nameMemory)

  if (!pattern.nameResolutionPattern) return matchedNodes
  const nameResolution = pattern.nameResolutionPattern

  return matchedNodes.map(node => {
    const foundNames = new NameMemory(nameMemory)
    const nameVariable = getVariableForName(pattern.variableForName)
    foundNames.saveName(nameVariable, node.nodeName)
    const resolvedName = resolveName(nameResolution, filePath, allFiles, foundNames)
    if (!resolvedName) {
      Logger.warn(`could not resolve name '${node}'`)
      return new MatchedNode(node.nodeName, foundNames)
    }
    Logger.log(`resolved node with name '${node.nodeName}' to actual name '${resolvedName}'.\ncurrent name memory\n---\n${foundNames.toString()}`)
    return new MatchedNode(resolvedName, foundNames)
  })
}

function getVariableForName(variableForName: string | undefined): string {
  return variableForName ?? 'name'
}

interface Content {
  read(): string
  filePath(): string
}

class FileContent implements Content {
  constructor(private readonly file: string) {}
  read(): string {
    return fs.readFileSync(this.file, 'utf8')
  }
  filePath(): string {
    return this.file
  }
}

class PathContent implements Content {
  constructor(private readonly path: string) {}
  read(): string {
    return this.path
  }
  filePath(): string {
    return this.path
  }
}

/**
 * resolves a final name by traversing a chain of name resolution patterns.
 * when the end of the chain is reached, the name is either resolved and returned or undefined.
 * when traversing the chain, each matched name is added to the matchedNames map
 * and it may be referenced by its variable name in the next chain elements.
 *
 * @param nameResolution the name resolution pattern used for resolving the name
 * @param filePath the current file to be searched in
 * @param allFiles list of all files which are used in the search
 * @param foundNames map of names found by matching regular expressions in name resolution chains so far
 */
function resolveName(nameResolution: NamePattern, filePath: string, allFiles: string[],
  foundNames: NameMemory): string | undefined {

  const regExp = replaceNameVariables(nameResolution.regExp, foundNames)

  const contents = getContentsToResolveNodeNameFrom(nameResolution, filePath, allFiles)
  for (const content of contents) {
    const resolvedNames = matchNodeNameByRegExp(regExp, content.read(), 1, nameResolution.variableForName, foundNames)
    if (resolvedNames.length === 1) {
      const resolvedName = resolvedNames[0]
      const nameVariable = getVariableForName(nameResolution.variableForName)
      foundNames.saveName(nameVariable, resolvedName.nodeName)

      if (!nameResolution.nameResolutionPattern) {
        return resolvedName.nodeName
      } else {
        // continue with next resolution pattern
        const nextFilePath = nameResolution.searchTextLocation === SearchTextLocation.FILE_PATH
          ? content.filePath()
          : filePath

        Logger.log(`continuing name resolution for file '${nextFilePath}' and for pattern with regexp '${nameResolution.regExp}'`)
        const resolvedName = resolveName(nameResolution.nameResolutionPattern, nextFilePath, allFiles, foundNames)
        if (resolvedName) return resolvedName
      }
    }

  }
  return undefined
}

function replaceNameVariables(regExp: string, nameMemory: NameMemory): string {
  for (const variable of nameMemory.getCurrentNames().entries()) {
    regExp = regExp.replace('$' + variable[0], variable[1])
  }
  if (nameMemory.inheritedNameMemory) {
    regExp = replaceNameVariables(regExp, nameMemory.inheritedNameMemory)
  }
  return regExp
}

function getContentsToResolveNodeNameFrom(nameResolution: NamePattern, filePath: string, allFiles: string[]): Content[] {
  if (nameResolution.searchTextLocation === SearchTextLocation.FILE_CONTENT) {
    return [new FileContent(filePath)]
  } else if (nameResolution.searchTextLocation === SearchTextLocation.ANY_FILE_CONTENT) {
    return allFiles.map(file => new FileContent(file))
  } else if (nameResolution.searchTextLocation === SearchTextLocation.FILE_PATH) {
    return allFiles.map(file => new PathContent(file))
  } else {
    return []
  }
}

function matchNodeName(pattern: NodePattern, filePath: string, nameMemory: NameMemory): MatchedNode[] {
  if (pattern.searchTextLocation === SearchTextLocation.FILE_PATH) {
    return matchNodeNameByNodePattern(pattern, filePath, nameMemory)
  }
  if (pattern.searchTextLocation === SearchTextLocation.FILE_CONTENT) {
    const fileContent = fs.readFileSync(filePath, 'utf8')
    return matchNodeNameByNodePattern(pattern, fileContent, nameMemory)
  }
  return []
}

function matchNodeNameByNodePattern(pattern: NodePattern, searchText: string, nameMemory: NameMemory): MatchedNode[] {
  const variableForName = getVariableForName(pattern.variableForName)
  return matchNodeNameByRegExp(pattern.regExp, searchText, pattern.capturingGroupIndexForName, variableForName, nameMemory)
}

function matchNodeNameByRegExp(regExpString: string, searchText: string,
  capturingGroupIndexForName: number, variableForName: string, inheritedNameMemory: NameMemory
): MatchedNode[] {
  const regExpWithReplacedVariables = replaceNameVariables(regExpString, inheritedNameMemory)
  const regExp = new RegExp(regExpWithReplacedVariables, 'g')

  return getAllPatternMatches<MatchedNode>(regExp, searchText,
    (matchArray: RegExpExecArray) => {
      if (matchArray.length >= capturingGroupIndexForName) {
        const name = matchArray[capturingGroupIndexForName]
        Logger.log(`matched name '${name}' from regexp '${regExpString}'`)
        const nameMemory = new NameMemory(inheritedNameMemory)
        nameMemory.saveName(variableForName, name)
        return new MatchedNode(name, nameMemory)
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
