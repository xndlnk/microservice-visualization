import { Injectable, Logger } from '@nestjs/common'
import * as _ from 'lodash'
import * as fs from 'fs'
import { findFiles, getServiceNameFromPath, isNoSourceOfThisProject } from '../../source-code-analysis/file-analysis/analysis'

import { ConfigService } from '../../config/Config.service'
import { System, AsyncEventFlow, MicroService } from '../../model/ms'

// tslint:disable-next-line
import * as ms from '../../model/ms'

@Injectable()
export class AnnotationAnalyzer {
  private readonly className = AnnotationAnalyzer.name
  private readonly logger = new Logger(this.className)

  constructor(
    private readonly config: ConfigService
  ) { }

  public async transform(system: System): Promise<System> {
    await this.transformSourcesInPath(system, this.config.getSourceFolder())
    return system
  }

  private async transformSourcesInPath(system: System, path: string) {
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

          const elementMappings: ElementMapping[] = [
            {
              elementDefiningNodeName: 'sendToExchange',
              nodeTypeToCreate: 'MessageExchange',
              nodeTypeDirection: 'target'
            },
            {
              elementDefiningNodeName: 'receiveFromExchange',
              nodeTypeToCreate: 'MessageExchange',
              nodeTypeDirection: 'source'
            }
          ]

          transformEachAnnotation(system, service, 'EventProcessor', fileContent, elementMappings)
        }
      })
  }
}

type ElementMapping = {
  elementDefiningNodeName: string
  nodeTypeToCreate: string
  nodeTypeDirection: string // source or target
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

  for (const elementMapping of elementMappings) {
    // TODO: process multiple mappings
    const elementPattern = elementMapping.elementDefiningNodeName + '\\s*=\\s*([^\\),]+)'
    const elementRegExp = new RegExp(elementPattern, 'g')
    const elementValues = getAllPatternMatches<string>(elementRegExp, annotationBody,
      (matchArray: RegExpExecArray) => matchArray[1])

    elementValues.forEach(value => transformElementValueExpression(system, service, fileContent,
      elementMapping, value))
  }
}

function transformElementValueExpression(system: System, service: MicroService, fileContent: string,
  elementMapping: ElementMapping, valueExpression: string) {

  const nodeName = getActualValue(valueExpression, fileContent)
  if (!nodeName) return

  // TODO: better use system.addOrExtendNamedNode() but without type annotations
  const payload = { name: nodeName }
  const node = new ms[elementMapping.nodeTypeToCreate](nodeName, payload, AnnotationAnalyzer.name)
  system.nodes.push(node)

  if (elementMapping.nodeTypeDirection === 'target') {
    // TODO: make AsyncEventFlow configurable
    system.edges.push(new AsyncEventFlow(service, node,
      undefined, AnnotationAnalyzer.name))
  } else if (elementMapping.nodeTypeDirection === 'source') {
    system.edges.push(new AsyncEventFlow(node, service,
      undefined, AnnotationAnalyzer.name))
  } else {
    // TODO: log error
  }
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
