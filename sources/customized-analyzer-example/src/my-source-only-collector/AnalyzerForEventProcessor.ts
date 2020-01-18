import { Injectable } from '@nestjs/common'

import {
  System, patternAnalyzer, ConfigService
} from 'tadis-analyzer'

@Injectable()
export class AnalyzerForEventProcessor {

  constructor(
    private readonly configService: ConfigService,
    private readonly patternAnalyzer: patternAnalyzer.PatternAnalyzer
  ) { }

  public async transform(system: System): Promise<System> {
    return this.patternAnalyzer.transform(system, this.getEventProcessorPattern())
  }

  private getEventProcessorPattern(): patternAnalyzer.SystemPattern {
    const ws = '\\s*'
    const id = '\\w+'

    const javaSourceFilePattern: patternAnalyzer.NodePattern = {
      searchTextLocation: patternAnalyzer.SearchTextLocation.FILE_PATH,
      regExp: '$sourceRoot.*/dummy-system-source/([^/]+)/.+java',
      capturingGroupIndexForNodeName: 1,
      nodeType: 'MicroService'
    }

    return {
      nodePatterns: [],
      edgePatterns: [
        {
          edgeType: 'AsyncEventFlow',
          sourceNodePattern: javaSourceFilePattern,
          targetNodePattern: {
            searchTextLocation: patternAnalyzer.SearchTextLocation.FILE_CONTENT,
            regExp: `@EventProcessor${ws}\\([^)]*sendToExchange${ws}=${ws}(${id})`,
            capturingGroupIndexForNodeName: 1,
            nameResolution: {
              searchTextLocation: patternAnalyzer.SearchTextLocation.FILE_CONTENT,
              regExp: `$name${ws}=${ws}"([^"]*)"`
            },
            nodeType: 'MessageExchange'
          }
        },
        {
          edgeType: 'AsyncEventFlow',
          sourceNodePattern: javaSourceFilePattern,
          targetNodePattern: {
            searchTextLocation: patternAnalyzer.SearchTextLocation.FILE_CONTENT,
            regExp: `@EventProcessor${ws}\\([^)]*sendToExchange${ws}=${ws}"([^"]+)"`,
            capturingGroupIndexForNodeName: 1,
            nodeType: 'MessageExchange'
          }
        }
      ]
    }
  }
}
