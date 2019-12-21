import { Injectable, Logger } from '@nestjs/common'
import * as _ from 'lodash'
import * as fs from 'fs'
import { findFiles, getServiceNameFromPath, isNoSourceOfThisProject } from '../source-code-analysis/file-analysis/analysis'

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

  public async transformPattern(system: System, systemPattern: SystemPattern): Promise<System> {
    await transformPatternInPath(system, systemPattern, this.config.getSourceFolder())
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
}

export enum SearchTextLocation {
  FILE_PATH,
  FILE_CONTENT
}

export type EdgePattern = {
  sourceNodePattern: NodePattern
  targetNodePattern: NodePattern
  edgeType: string
}

// DEPRECATED: just for repl testing
const inputSystem = new System('test')

const sourcePathRoot = __dirname + '/testdata/source-folder'

const systemPattern: SystemPattern = {
  servicePatterns: [
    {
      searchTextLocation: SearchTextLocation.FILE_PATH,
      regExp: sourcePathRoot + '/([^/]+)/source\.java',
      capturingGroupIndexForNodeName: 1,
      nodeType: 'MicroService'
    }
  ],
  edgePatterns: []
}

transformPatternInPath(inputSystem, systemPattern, sourcePathRoot)

async function transformPatternInPath(system: System, systemPattern: SystemPattern, sourceFolder: string) {
  logger.log('scanning all files in ' + sourceFolder)
  // TODO: extract method
  const allFilesRaw = await findFiles(sourceFolder, null)
  logger.log('found ' + allFilesRaw.length + ' files')

  const allFiles = allFilesRaw.filter(file => isNoSourceOfThisProject(file))

  systemPattern.servicePatterns.forEach(pattern => {
    if (pattern.searchTextLocation === SearchTextLocation.FILE_PATH) {
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
