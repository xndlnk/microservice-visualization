import { Injectable } from '@nestjs/common'
import * as _ from 'lodash'

import { ConfigService } from '../../config/Config.service'
import { System } from '../../model/ms'
import { SystemPattern, NodePattern, EdgePattern, NameResolution, SearchTextLocation } from './model'
export { SystemPattern, NodePattern, EdgePattern, NameResolution, SearchTextLocation } from './model'

import { PatternAnalyzer } from './PatternAnalyzer'

/**
 * The PatternAnalyzer allows to derive a system from source code patterns defined by regular expressions.
 */
@Injectable()
export class PatternAnalyzerService {
  private patternAnalyzer: PatternAnalyzer | undefined

  constructor(
    private readonly config: ConfigService
  ) { }

  public async transform(system: System, systemPattern: SystemPattern): Promise<System> {
    if (!this.patternAnalyzer) {
      this.patternAnalyzer = new PatternAnalyzer(this.config.getSourceFolder())
    }
    return this.patternAnalyzer.transform(system, systemPattern)
  }
}
