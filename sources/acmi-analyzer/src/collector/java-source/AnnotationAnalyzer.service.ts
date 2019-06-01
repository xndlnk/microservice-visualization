import { Injectable, Logger } from '@nestjs/common'
import * as _ from 'lodash'
import * as fs from 'fs'
import { findFiles, getServiceNameFromPath, isNoSourceOfThisProject } from '../../source-code-analysis/file-analysis/analysis'

import { ConfigService } from '../../config/Config.service'
import { System, MicroService } from '../../model/ms'

// tslint:disable-next-line
import * as ms from '../../model/ms'
import { Metadata } from 'src/model/core'

const logger = new Logger('AnnotationAnalyzer')

@Injectable()
export class AnnotationAnalyzer {
  private readonly className = AnnotationAnalyzer.name
  private readonly logger = new Logger(this.className)

  constructor(
    private readonly config: ConfigService
  ) { }

  public async transform(system: System, annotation: string, elementMappings: ElementMapping[]): Promise<System> {
    await this.transformSourcesInPath(system, this.config.getSourceFolder(), annotation, elementMappings)
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

export type ElementMapping = {
  /**
   * name of the annotation element that defines the node name as its value
   */
  elementName: string

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

  if (annotationBodies.length > 0) {
    logger.log('analyzing annotation bodies in service ' + service.getName())
  }

  annotationBodies.forEach(body => transformEachElement(system, service, fileContent,
    body, elementMappings))
}

function transformEachElement(system: System, service: MicroService, fileContent: string,
  annotationBody: string, elementMappings: ElementMapping[]) {

  logger.log('analyzing annotation body:\n' + annotationBody)

  for (const elementMapping of elementMappings) {
    logger.log('analyzing element:\n' + elementMapping.elementName)

    const elementPattern = elementMapping.elementName + '\\s*=\\s*([^\\),]+)'
    const elementRegExp = new RegExp(elementPattern, 'g')
    const elementValues = getAllPatternMatches<string>(elementRegExp, annotationBody,
      (matchArray: RegExpExecArray) => matchArray[1])

    elementValues.forEach(value => transformElementValueExpression(system, service, fileContent,
      elementMapping, value))
  }
}

function transformElementValueExpression(system: System, service: MicroService, fileContent: string,
  elementMapping: ElementMapping, valueExpression: string) {

  logger.log('analyzing value expression:\n' + valueExpression)

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
    transformer: AnnotationAnalyzer.name,
    context: 'service ' + service.id
  }

  const payload = { name: nodeName }
  // TODO: better use system.addOrExtendNamedNode() but without type annotations
  // TODO: check for types to be present

  // TODO: same node must be created twice
  // const node = new ms[elementMapping.nodeTypeToCreate](nodeName, payload, AnnotationAnalyzer.name)
  // system.nodes.push(node)
  const node = system.addMessageExchange(nodeName, undefined, metadata)

  logger.log('added node ' + nodeName)

  if (elementMapping.nodeTypeDirection === 'target') {
    const edge = new ms[elementMapping.edgeType](service, node, undefined, metadata)
    system.edges.push(edge)
  } else if (elementMapping.nodeTypeDirection === 'source') {
    const edge = new ms[elementMapping.edgeType](node, service, undefined, metadata)
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
