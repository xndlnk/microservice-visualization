import { Injectable, Logger } from '@nestjs/common'
import * as _ from 'lodash'
import * as fs from 'fs'
import { findFiles, getServiceNameFromPath, isNoSourceOfThisProject } from '../../source-code-analysis/file-analysis/analysis'

import { ConfigService } from '../../config/config.service'
import { System, SyncDataFlow } from '../../model/ms'

@Injectable()
export class FeignClientsFromSourceCodeProducer {
  private readonly className = FeignClientsFromSourceCodeProducer.name
  private readonly logger = new Logger(this.className)

  constructor(
    private readonly config: ConfigService
  ) { }

  public async transform(system: System): Promise<System> {
    const scanResults = await this.scanPathForFeignClients(this.config.getSourceFolder())
    for (const scanResult of scanResults) {
      const sourceService = system.addMicroService(scanResult.serviceName, undefined, this.className)
      const targetService = system.addMicroService(scanResult.feignClient.targetServiceName, undefined, this.className)

      // adds links in reverse to visualize information flow, TODO: make this configurable
      const definedEndpoints = scanResult.feignClient.requestMappings
        .map(mapping => ({ path: mapping.value }))
      const dataFlow = new SyncDataFlow(targetService, sourceService, { definedEndpoints }, this.className)
      system.edges.push(dataFlow)

      this.logger.log(`added sync data flow: ${targetService.getPayload().name} -> ${sourceService.getPayload().name}`)
    }
    return system
  }

  private async scanPathForFeignClients(path: string): Promise<ScanResult[]> {
    this.logger.log('scanning for feign clients in ' + path)
    const javaFiles = await findFiles(path, '.java')
    this.logger.log('found ' + javaFiles.length + ' java files')

    const scanResults: ScanResult[] = []
    javaFiles
      .filter(file => isNoSourceOfThisProject(file))
      .forEach((file) => {
        const feignClient = getFeignClientInFile(file)
        if (feignClient) {
          const serviceName = getServiceNameFromPath(path, file)
          const scanResult: ScanResult = {
            file,
            serviceName,
            feignClient
          }
          scanResults.push(scanResult)
          this.logger.log('found feign client annotation in service ' + scanResult.serviceName)
        }
      })

    return scanResults
  }
}

type ScanResult = {
  file: string,
  serviceName: string,
  feignClient: FeignClient
}

type FeignClient = {
  targetServiceName: string,
  requestMappings: RequestMapping[]
}

function getFeignClientInFile(path): FeignClient | undefined {
  // TODO: make this async
  const fileContent = fs.readFileSync(path, 'utf8')

  const feignPattern = /@FeignClient\s*\(\s*(value\s*=)?\s*"([\w-]+)"/
  const feignMatch = fileContent.match(feignPattern)
  if (feignMatch) {
    return {
      targetServiceName: feignMatch[2],
      requestMappings: getRequestMappings(fileContent)
    }
  }

  return undefined
}

type RequestMapping = {
  value: string
}

function getRequestMappings(fileContent: string): RequestMapping[] {
  const mappings = []
  const pattern = /@RequestMapping\s*\(\s*(value\s*=)?\s*"(.+)"/ig
  let matches = pattern.exec(fileContent)
  while (matches != null) {
    mappings.push({ value: matches[2] })
    matches = pattern.exec(fileContent)
  }
  return mappings
}
