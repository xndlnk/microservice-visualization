import { Injectable, Logger } from '@nestjs/common'
import * as _ from 'lodash'

import { ConfigService } from '../../config/Config.service'
import { System } from '../../model/ms'
import { SystemPattern, NodePattern, EdgePattern, NamePattern, SearchTextLocation } from './model'
export { SystemPattern, NodePattern, EdgePattern, NamePattern, SearchTextLocation } from './model'

import { PatternAnalyzer } from './PatternAnalyzer'

/**
 * The PatternAnalyzer allows to derive a system from source code patterns defined by regular expressions.
 */
@Injectable()
export class PatternAnalyzerService {

  private readonly patternAnalyzer: PatternAnalyzer
  private currentPattern: SystemPattern

  constructor(
    private readonly config: ConfigService
  ) {
    this.patternAnalyzer = new PatternAnalyzer(this.config.getSourceFolder())
    this.currentPattern = {
      nodePatterns: [],
      edgePatterns: []
    }
  }

  public async getSystem(): Promise<System> {
    return this.transform(new System(''), this.currentPattern)
  }

  public updateSystemPattern(pattern: SystemPattern) {
    Logger.log('updated system pattern:\n' + JSON.stringify(pattern, null, 2))
    this.currentPattern = pattern
  }

  public async transform(system: System, systemPattern: SystemPattern): Promise<System> {
    return this.patternAnalyzer.transform(system, systemPattern)
  }
}
