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
              nodeTypeToCreate: 'MessageExchange'
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
}

function transformEachAnnotation(system: System, service: MicroService,
  annotationName: string, fileContent: string, elementMappings: ElementMapping[]) {

  const annotationPattern = '@' + annotationName + '\\s*\\(([^\\)]+)\\)'
  const annotationRegExp = new RegExp(annotationPattern, 'g')
  const annotations = getAllPatternMatches<string>(annotationRegExp, fileContent,
    (matchArray: RegExpExecArray) => matchArray[1])
  if (annotations.length === 0) return

  annotations.forEach(annotation => transformElement(system, service, fileContent,
    annotation, elementMappings))
}

function transformElement(system: System, service: MicroService, fileContent: string,
  annotationBody: string, elementMappings: ElementMapping[]) {

  // TODO: process multiple mappings
  const elementPattern = elementMappings[0].elementDefiningNodeName + '\\s*=\\s*([^\\),]+)'
  const elementRegExp = new RegExp(elementPattern, 'g')
  const elementValues = getAllPatternMatches<string>(elementRegExp, annotationBody,
    (matchArray: RegExpExecArray) => matchArray[1])
  if (elementValues.length === 0) return

  let targetNodeName = elementValues[0]

  if (targetNodeName) {
    if (targetNodeName.startsWith('"')) {
      targetNodeName = targetNodeName.substr(1, targetNodeName.length - 2)
    } else {
      // TODO: skip if defined in comment
      const assignmentPattern = targetNodeName + '\\s*=\\s*"([^"]*)"'
      const assignmentRegExp = new RegExp(assignmentPattern, 'g')
      const assignmentValues = getAllPatternMatches<string>(assignmentRegExp, fileContent,
        (matchArray: RegExpExecArray) => matchArray[1])
      targetNodeName = assignmentValues[0]
    }
  }

  // TODO: better use system.addOrExtendNamedNode() but without type annotations
  const payload = { name: targetNodeName }
  const targetExchange = new ms[elementMappings[0].nodeTypeToCreate](targetNodeName, payload, AnnotationAnalyzer.name)
  system.nodes.push(targetExchange)

  system.edges.push(new AsyncEventFlow(service, targetExchange,
    undefined, AnnotationAnalyzer.name))
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
