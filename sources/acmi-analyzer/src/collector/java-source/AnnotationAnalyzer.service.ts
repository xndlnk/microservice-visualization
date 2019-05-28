import { Injectable, Logger } from '@nestjs/common'
import * as _ from 'lodash'
import * as fs from 'fs'
import { findFiles, getServiceNameFromPath, isNoSourceOfThisProject } from '../../source-code-analysis/file-analysis/analysis'

import { ConfigService } from '../../config/Config.service'
import { System, AsyncEventFlow } from '../../model/ms'

@Injectable()
export class AnnotationAnalyzer {
  private readonly className = AnnotationAnalyzer.name
  private readonly logger = new Logger(this.className)

  constructor(
    private readonly config: ConfigService
  ) { }

  public async transform(system: System): Promise<System> {
    const scanResults = await this.scanPath(this.config.getSourceFolder())
    for (const scanResult of scanResults) {
      const currentService = system.addMicroService(scanResult.currentNodeName,
        undefined, this.className)
      const targetExchange = system.addMessageExchange(scanResult.patternMatch.targetNodeName,
        undefined, this.className)
      system.edges.push(new AsyncEventFlow(currentService, targetExchange,
        undefined, this.className))
    }
    return system
  }

  private async scanPath(path: string): Promise<ScanResult[]> {
    this.logger.log('scanning java files in ' + path)
    const javaFiles = await findFiles(path, '.java')
    this.logger.log('found ' + javaFiles.length + ' java files')

    const scanResults: ScanResult[] = []
    javaFiles
      .filter(file => isNoSourceOfThisProject(file))
      .forEach((file) => {
        const matches = findPatternsInFile(file)
        if (matches && matches.length > 0) {
          const serviceName = getServiceNameFromPath(path, file)
          for (const match of matches) {
            scanResults.push({
              file,
              currentNodeName: serviceName,
              patternMatch: match
            })
          }
        }
      })

    return scanResults
  }
}

type ScanResult = {
  file: string,
  currentNodeName: string,
  patternMatch: PatternMatch
}

type PatternMatch = {
  targetNodeName: string
}

function findPatternsInFile(path): PatternMatch[] | undefined {
  // TODO: make this async
  const fileContent = fs.readFileSync(path, 'utf8')

  return findTargetExchangeInEachAnnotation(fileContent)
}

function findTargetExchangeInEachAnnotation(content: string): PatternMatch[] {
  const annotationPattern = /@EventProcessor\s*\(([^\)]+)\)/g
  const annotations = getAllPatternMatches<string>(annotationPattern, content,
    (matchArray: RegExpExecArray) => matchArray[1])

  const elementPattern = /sendToExchange\s*=\s*([^\),]+)/g
  const elementValues = getAllPatternMatches<string>(elementPattern, annotations[0],
    (matchArray: RegExpExecArray) => matchArray[1])
  const match: PatternMatch = {
    targetNodeName: elementValues[0]
  }

  if (match.targetNodeName) {
    if (match.targetNodeName.startsWith('"')) {
      match.targetNodeName = match.targetNodeName.substr(1, match.targetNodeName.length - 2)
    } else {
      // TODO: skip if defined in comment
      const assignmentPattern = match.targetNodeName + '\\s*=\\s*"([^"]*)"'
      const assignmentRegExp = new RegExp(assignmentPattern, 'g')
      const assignmentValues = getAllPatternMatches<string>(assignmentRegExp, content,
        (matchArray: RegExpExecArray) => matchArray[1])
      match.targetNodeName = assignmentValues[0]
    }
  }

  return [match]
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
