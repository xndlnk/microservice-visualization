import { Injectable, Logger } from '@nestjs/common'
import * as _ from 'lodash'
import * as fs from 'fs'
import { findFiles, findFilesSafe, getServiceNameFromPath, isNoSourceOfThisProject } from '../source-code-analysis/file-analysis/analysis'

import { ConfigService } from '../config/Config.service'
import { System, MicroService } from '../model/ms'

// tslint:disable-next-line
import * as ms from '../model/ms'
import { Metadata } from 'src/model/core'

const logContext = 'PatternAnalyzer'
const logger = {
  log: (message: string) => Logger ? Logger.log(message, logContext) : console.log(message)
}

@Injectable()
export class PatternAnalyzer {
  private readonly logger = new Logger(PatternAnalyzer.name)

  constructor(
    private readonly config: ConfigService
  ) { }

  public async transform(system: System, annotation: string, elementMappings: ElementMapping[]): Promise<System> {
    await this.transformSourcesInPath(system, this.config.getSourceFolder(), annotation, elementMappings)
    return system
  }

  public async transformByPattern(system: System, systemPattern: SystemPattern): Promise<System> {
    await transformByPatternInPath(system, systemPattern, this.config.getSourceFolder())
    return system
  }

  private async transformSourcesInPath(system: System, path: string, annotation: string, elementMappings: ElementMapping[]) {
    this.logger.log('scanning java files in ' + path)
    const javaFiles = await findFiles(path, '.java')
    this.logger.log('found ' + javaFiles.length + ' java files')

    javaFiles
      .filter(file => isNoSourceOfThisProject(file))
      .forEach((file) => {
        // TODO: make this async
        const serviceName = getServiceNameFromPath(path, file)
        const service = system.findMicroService(serviceName)
        if (!service) {
          this.logger.log('skipping source of microservice ' + serviceName + ' because it is not part of the input system.')
        } else {
          const fileContent = fs.readFileSync(file, 'utf8')

          transformEachAnnotation(system, service, annotation, fileContent, elementMappings)
        }
      })
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

export type NameResolution = {
  searchTextLocation: SearchTextLocation
  regExp: string // $name can be used to refer to the node name
}

export enum SearchTextLocation {
  FILE_PATH,
  FILE_CONTENT // content of file in current file path
}

export type EdgePattern = {
  sourceNodePattern: NodePattern
  targetNodePattern: NodePattern
  edgeType: string
}

async function transformByPatternInPath(system: System, systemPattern: SystemPattern, sourceFolder: string) {
  logger.log('scanning all files in ' + sourceFolder)
  const allFiles = await findFilesSafe(sourceFolder, null)
  logger.log('found ' + allFiles.length + ' files')

  allFiles.forEach(filePath => {
    systemPattern.servicePatterns.forEach(servicePattern => {
      if (servicePattern.searchTextLocation === SearchTextLocation.FILE_PATH) {
        transformAllByFilePathPattern(system, allFiles, servicePattern)
      }
    })

    systemPattern.edgePatterns.forEach(edgePattern => transformByEdgePattern(system, edgePattern, filePath))
  })
}

function transformByEdgePattern(system: System, edgePattern: EdgePattern, filePath: string) {
  const sourceNodeName = matchNodeName(edgePattern.sourceNodePattern, filePath)
  if (!sourceNodeName) return
  logger.log(`found source node '${sourceNodeName}'`)

  const targetNodeName = matchNodeName(edgePattern.targetNodePattern, filePath)
  if (!targetNodeName) return
  logger.log(`found target node '${targetNodeName}'`)

  const metadata: Metadata = {
    transformer: PatternAnalyzer.name,
    context: `edge pattern with source node '${sourceNodeName}'`,
    info: `matched target node '${targetNodeName}'`
  }

  const sourceNode = system.addOrExtendTypedNode(edgePattern.sourceNodePattern.nodeType, sourceNodeName)
  const targetNode = system.addOrExtendTypedNode(edgePattern.targetNodePattern.nodeType, targetNodeName)

  const edge = new ms[edgePattern.edgeType](sourceNode, targetNode, undefined, metadata)
  system.edges.push(edge)

  logger.log(`added edge '${sourceNodeName}' --(${edgePattern.edgeType})--> '${targetNodeName}'`)
}

function matchNodeName(pattern: NodePattern, filePath: string): string | null {
  if (pattern.searchTextLocation === SearchTextLocation.FILE_PATH) {
    return matchNodeNameInSearchText(pattern, filePath)
  }
  if (pattern.searchTextLocation === SearchTextLocation.FILE_CONTENT) {
    const fileContent = fs.readFileSync(filePath, 'utf8')
    return matchNodeNameInSearchText(pattern, fileContent)
  }
  return null
}

function matchNodeNameInSearchText(pattern: NodePattern, searchText: string): string | null {
  const regExp = new RegExp(pattern.regExp)
  const matches = searchText.match(regExp)
  if (matches && matches.length >= pattern.capturingGroupIndexForNodeName) {
    return matches[pattern.capturingGroupIndexForNodeName]
  }
  return null
}

function transformAllByFilePathPattern(system: System, allFiles: string[], pattern: NodePattern) {
  allFiles.forEach(file => {
    const regExp = new RegExp(pattern.regExp)
    const matches = file.match(regExp)
    if (matches && matches.length >= pattern.capturingGroupIndexForNodeName) {
      const nodeName = matches[pattern.capturingGroupIndexForNodeName]
      system.addOrExtendTypedNode(pattern.nodeType, nodeName)
      logger.log(`added node with name ${nodeName} of type ${pattern.nodeType}`)
    }
  })
}

/**
 * Specifies a mapping of an annotation element to nodes and edges.
 */
export type ElementMapping = {
  /**
   * name of the annotation element from which a node is derived.
   * the value of the annotation element defines the name of the node.
   * the node will be created if it does not already exist or else an existing node will be re-used.
   */
  elementToDeriveNodeFrom: string

  /**
   * class name of the node to create for the element
   */
  nodeTypeToCreate: string

  /**
   * specifies if the node will be the source or the target of the microservice
   * that contains the annotation in its source code.
   * values: only source or target
   */
  nodeTypeDirection: string

  /**
   * specifies the class name of the edge that will be created between the
   * current microservice and the node
   */
  edgeType: string
}

function transformEachAnnotation(system: System, service: MicroService,
  annotationName: string, fileContent: string, elementMappings: ElementMapping[]) {

  const annotationPattern = '@' + annotationName + '\\s*\\(([^\\)]+)\\)'
  const annotationRegExp = new RegExp(annotationPattern, 'g')
  const annotationBodies = getAllPatternMatches<string>(annotationRegExp, fileContent,
    (matchArray: RegExpExecArray) => matchArray[1])

  annotationBodies.forEach(body => transformEachElement(system, service, fileContent,
    body, elementMappings))
}

function transformEachElement(system: System, service: MicroService, fileContent: string,
  annotationBody: string, elementMappings: ElementMapping[]) {

  logger.log('analyzing annotation body in service ' + service.getName() + ':\n' + annotationBody)

  for (const elementMapping of elementMappings) {
    const elementPattern = elementMapping.elementToDeriveNodeFrom + '\\s*=\\s*([^\\),]+)'
    const elementRegExp = new RegExp(elementPattern, 'g')
    const matchingElementValues = getAllPatternMatches<string>(elementRegExp, annotationBody,
      (matchArray: RegExpExecArray) => matchArray[1])

    matchingElementValues.forEach(value => transformElementValueExpression(system, service, fileContent,
      elementMapping, value))
  }
}

function transformElementValueExpression(system: System, service: MicroService, fileContent: string,
  elementMapping: ElementMapping, valueExpression: string) {

  const nodeName = getActualValue(valueExpression, fileContent)
  if (!nodeName) return

  executeMappingForNode(system, service, elementMapping, nodeName)
}

function getActualValue(valueExpression: string, fileContent: string): string {
  if (valueExpression.startsWith('"')) {
    return valueExpression.substr(1, valueExpression.length - 2)
  } else {
    // search variable assignment
    // TODO: skip if defined in comment
    const assignmentPattern = valueExpression + '\\s*=\\s*"([^"]*)"'
    const assignmentRegExp = new RegExp(assignmentPattern, 'g')
    const assignmentValues = getAllPatternMatches<string>(assignmentRegExp, fileContent,
      (matchArray: RegExpExecArray) => matchArray[1])
    return assignmentValues.length > 0 ? assignmentValues[0] : undefined
  }
}

function executeMappingForNode(system: System, service: MicroService,
  elementMapping: ElementMapping, nodeName: string) {

  const metadata: Metadata = {
    transformer: PatternAnalyzer.name,
    context: 'service ' + service.id,
    info: 'mapping of element ' + elementMapping.elementToDeriveNodeFrom + ' to target ' + nodeName
  }
  const node = system.addOrExtendTypedNode(elementMapping.nodeTypeToCreate, nodeName, undefined, metadata)

  logger.log('ensured node of type ' + elementMapping.nodeTypeToCreate + ' and name ' + nodeName + ' exists.')

  if (elementMapping.nodeTypeDirection === 'target') {
    const edge = new ms[elementMapping.edgeType](service, node, undefined, metadata)
    system.edges.push(edge)
    logger.log('added ' + elementMapping.edgeType + ': ' + service.id + ' -> ' + node.id)
  } else if (elementMapping.nodeTypeDirection === 'source') {
    const edge = new ms[elementMapping.edgeType](node, service, undefined, metadata)
    logger.log('added ' + elementMapping.edgeType + ': ' + node.id + ' -> ' + service.id)
    system.edges.push(edge)
  } else {
    // TODO: log error
  }
}

function getAllPatternMatches<MatchType>(pattern: RegExp, content: string,
  matchTransformer: ((matchArray: RegExpExecArray) => MatchType)): MatchType[] {
  const allMatches: MatchType[] = []

  let matches = pattern.exec(content)
  while (matches != null) {
    allMatches.push(matchTransformer(matches))
    matches = pattern.exec(content)
  }

  return allMatches
}
