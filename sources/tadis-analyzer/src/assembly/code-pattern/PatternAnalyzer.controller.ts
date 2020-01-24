import { Get, Controller, Logger, Query, Inject, Post, Body } from '@nestjs/common'

import { adaptToV1 } from '../../model/v1-legacy/v1-adapter'
import { convertCoreToTransportNode } from '../../model/transport'
import { PatternAnalyzerService } from './PatternAnalyzer.service'
import { SystemPattern } from './model'

@Controller('pattern-analyzer')
export class PatternAnalyzerController {

  constructor(
    private readonly patternAnalyzer: PatternAnalyzerService
  ) { }

  @Get('system')
  async getSystem(@Query('version') version: string): Promise<any> {
    const system = await this.patternAnalyzer.getSystem()

    if (version === '1') {
      return adaptToV1(system)
    }

    return convertCoreToTransportNode(system)
  }

  @Post('pattern')
  async updatePattern(@Body() systemPattern: SystemPattern) {
    this.patternAnalyzer.updateSystemPattern(systemPattern)
  }

}
